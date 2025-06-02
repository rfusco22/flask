from flask import Flask, request, jsonify, session, render_template, redirect, url_for, flash
from flask_cors import CORS
from flask_mail import Mail, Message
import pymysql
import random
import string
import os
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
import json

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = "prealca_secret_key_2023"

# Configuración de la base de datos MySQL (AWS RDS)
db_host = "prealca.cl2ys86au8wz.us-east-2.rds.amazonaws.com"
db_user = "rfusco22"
db_password = "19Ric19car2."
db_name = "prealca"

# Configuración del correo
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'fuscoriccardo19@gmail.com'
app.config['MAIL_PASSWORD'] = '30090650Rf'  # Usa contraseña de aplicación si es necesario
mail = Mail(app)

# Configuración para subida de archivos
UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Asegurar que la carpeta de uploads exista
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Función para conectar con la base de datos
def get_db_connection():
    return pymysql.connect(host=db_host,
                           user=db_user,
                           password=db_password,
                           db=db_name,
                           cursorclass=pymysql.cursors.DictCursor)

# Función para verificar extensiones de archivo permitidas
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Generar código de verificación
def generar_codigo():
    return ''.join(random.choices(string.digits, k=6))

# Rutas para la autenticación
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    connection = get_db_connection()
    with connection.cursor() as cursor:
        sql = "SELECT * FROM usuarios WHERE correo = %s AND contrasena = %s AND verificado = 1"
        cursor.execute(sql, (username, password))
        user = cursor.fetchone()
    
    connection.close()
    
    if user:
        session['user_id'] = user['id']
        session['user_role'] = user['rol']
        return jsonify({
            'success': True,
            'user': {
                'id': user['id'],
                'nombre': user['nombre'],
                'apellido': user['apellido'],
                'rol': user['rol']
            }
        })
    else:
        return jsonify({'success': False, 'message': 'Credenciales inválidas o cuenta no verificada'}), 401

@app.route('/api/register', methods=['POST'])
def register():
    data = request.form
    nombre = data.get('nombre')
    apellido = data.get('apellido')
    cedula = data.get('cedula')
    correo = data.get('correo')
    contrasena = data.get('contrasena')
    rol = data.get('rol')
    
    # Manejar la foto si se proporciona
    foto_path = None
    if 'foto' in request.files:
        foto = request.files['foto']
        if foto and allowed_file(foto.filename):
            filename = secure_filename(f"{cedula}_{datetime.now().strftime('%Y%m%d%H%M%S')}.{foto.filename.rsplit('.', 1)[1].lower()}")
            foto_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            foto.save(foto_path)
    
    codigo = generar_codigo()  # Generar un código aleatorio
    
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Verificar si el correo ya existe
            sql_check = "SELECT id FROM usuarios WHERE correo = %s"
            cursor.execute(sql_check, (correo,))
            if cursor.fetchone():
                connection.close()
                return jsonify({'success': False, 'message': 'El correo ya está registrado'}), 400
            
            # Insertar usuario con estado "pendiente" y sin verificación
            sql = """INSERT INTO usuarios (nombre, apellido, cedula, correo, contrasena, rol, foto, codigo_verificacion, verificado) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 0)"""
            cursor.execute(sql, (nombre, apellido, cedula, correo, contrasena, rol, foto_path, codigo))
            connection.commit()
            
            # Obtener el ID del usuario recién insertado
            user_id = cursor.lastrowid
    except Exception as e:
        connection.close()
        return jsonify({'success': False, 'message': str(e)}), 500
    
    connection.close()
    
    # Enviar el código de verificación al correo del usuario
    try:
        msg = Message("Código de Verificación - Prealca", sender=app.config['MAIL_USERNAME'], recipients=[correo])
        msg.body = f"Tu código de verificación es: {codigo}"
        mail.send(msg)
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error al enviar correo: {str(e)}'}), 500
    
    # Guardar el correo en la sesión para que pueda ser utilizado en la verificación
    session["user_email"] = correo
    
    return jsonify({
        'success': True, 
        'message': 'Usuario registrado. Se ha enviado un código de verificación a tu correo.',
        'user_id': user_id
    })

@app.route('/api/verify', methods=['POST'])
def verify():
    data = request.json
    codigo = data.get('codigo')
    correo = session.get("user_email")  # Obtener correo de la sesión
    
    if not correo:
        return jsonify({'success': False, 'message': 'Sesión expirada. Regístrate nuevamente.'}), 400
    
    connection = get_db_connection()
    with connection.cursor() as cursor:
        # Consultar el código de verificación en la base de datos
        sql = "SELECT id, codigo_verificacion FROM usuarios WHERE correo = %s AND verificado = 0"
        cursor.execute(sql, (correo,))
        resultado = cursor.fetchone()
    
    # Verificar si el código ingresado es correcto
    if resultado and codigo == resultado["codigo_verificacion"]:
        # Actualizar el estado del usuario a verificado
        with connection.cursor() as cursor:
            sql = "UPDATE usuarios SET verificado = 1 WHERE id = %s"
            cursor.execute(sql, (resultado["id"],))
            connection.commit()
        
        connection.close()
        return jsonify({'success': True, 'message': 'Verificación exitosa. Ya puedes iniciar sesión.'})
    else:
        connection.close()
        return jsonify({'success': False, 'message': 'Código incorrecto. Intenta nuevamente.'}), 400

@app.route('/api/resend_code', methods=['POST'])
def resend_code():
    correo = session.get("user_email")  # Obtener correo de la sesión
    
    if not correo:
        return jsonify({'success': False, 'message': 'Sesión expirada. Regístrate nuevamente.'}), 400
    
    # Generar un nuevo código
    nuevo_codigo = generar_codigo()
    
    connection = get_db_connection()
    with connection.cursor() as cursor:
        # Actualizar el código de verificación en la base de datos
        sql = "UPDATE usuarios SET codigo_verificacion = %s WHERE correo = %s AND verificado = 0"
        cursor.execute(sql, (nuevo_codigo, correo))
        connection.commit()
    
    connection.close()
    
    # Enviar el nuevo código al correo
    try:
        msg = Message("Nuevo Código de Verificación - Prealca", sender=app.config['MAIL_USERNAME'], recipients=[correo])
        msg.body = f"Tu nuevo código de verificación es: {nuevo_codigo}"
        mail.send(msg)
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error al enviar correo: {str(e)}'}), 500
    
    return jsonify({'success': True, 'message': 'Se ha enviado un nuevo código a tu correo.'})

@app.route('/api/forgot_password', methods=['POST'])
def forgot_password():
    data = request.json
    correo = data.get('email')
    
    connection = get_db_connection()
    with connection.cursor() as cursor:
        # Verificar si el correo existe
        sql = "SELECT id FROM usuarios WHERE correo = %s"
        cursor.execute(sql, (correo,))
        user = cursor.fetchone()
    
    if not user:
        connection.close()
        # No revelar si el correo existe o no por seguridad
        return jsonify({'success': True, 'message': 'Si el correo existe, recibirás instrucciones para recuperar tu contraseña.'})
    
    # Generar un token de recuperación
    token = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
    expiry = datetime.now() + timedelta(hours=1)  # Token válido por 1 hora
    
    with connection.cursor() as cursor:
        # Guardar el token en la base de datos
        sql = "UPDATE usuarios SET reset_token = %s, reset_token_expiry = %s WHERE id = %s"
        cursor.execute(sql, (token, expiry, user['id']))
        connection.commit()
    
    connection.close()
    
    # Enviar correo con enlace de recuperación
    try:
        reset_link = f"{request.host_url}reset_password?token={token}"
        msg = Message("Recuperación de Contraseña - Prealca", sender=app.config['MAIL_USERNAME'], recipients=[correo])
        msg.body = f"Para recuperar tu contraseña, haz clic en el siguiente enlace (válido por 1 hora): {reset_link}"
        mail.send(msg)
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error al enviar correo: {str(e)}'}), 500
    
    return jsonify({'success': True, 'message': 'Se han enviado instrucciones a tu correo para recuperar tu contraseña.'})

# Rutas para la gestión de datos

# Clientes
@app.route('/api/clientes', methods=['GET'])
def get_clientes():
    connection = get_db_connection()
    with connection.cursor() as cursor:
        sql = "SELECT * FROM clientes"
        cursor.execute(sql)
        clientes = cursor.fetchall()
    connection.close()
    return jsonify(clientes)

@app.route('/api/clientes', methods=['POST'])
def add_cliente():
    data = request.json
    nombre = data.get('nombre')
    direccion = data.get('direccion')
    telefono = data.get('telefono')
    documento = data.get('documento')
    vendedor_id = data.get('vendedor')
    
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = """INSERT INTO clientes (nombre, direccion, telefono, documento, vendedor_id) 
                    VALUES (%s, %s, %s, %s, %s)"""
            cursor.execute(sql, (nombre, direccion, telefono, documento, vendedor_id))
            connection.commit()
            cliente_id = cursor.lastrowid
        connection.close()
        return jsonify({'success': True, 'id': cliente_id, 'message': 'Cliente registrado exitosamente'})
    except Exception as e:
        connection.close()
        return jsonify({'success': False, 'message': str(e)}), 500

# Camiones
@app.route('/api/camiones', methods=['GET'])
def get_camiones():
    connection = get_db_connection()
    with connection.cursor() as cursor:
        sql = "SELECT * FROM camiones"
        cursor.execute(sql)
        camiones = cursor.fetchall()
    connection.close()
    return jsonify(camiones)

@app.route('/api/camiones', methods=['POST'])
def add_camion():
    data = request.form
    marca = data.get('marca')
    modelo = data.get('modelo')
    placa = data.get('placa')
    capacidad = data.get('capacidad')
    
    # Manejar la foto si se proporciona
    foto_path = None
    if 'foto' in request.files:
        foto = request.files['foto']
        if foto and allowed_file(foto.filename):
            filename = secure_filename(f"camion_{placa}_{datetime.now().strftime('%Y%m%d%H%M%S')}.{foto.filename.rsplit('.', 1)[1].lower()}")
            foto_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            foto.save(foto_path)
    
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = """INSERT INTO camiones (marca, modelo, placa, capacidad, foto) 
                    VALUES (%s, %s, %s, %s, %s)"""
            cursor.execute(sql, (marca, modelo, placa, capacidad, foto_path))
            connection.commit()
            camion_id = cursor.lastrowid
        connection.close()
        return jsonify({'success': True, 'id': camion_id, 'message': 'Camión registrado exitosamente'})
    except Exception as e:
        connection.close()
        return jsonify({'success': False, 'message': str(e)}), 500

# Choferes
@app.route('/api/choferes', methods=['GET'])
def get_choferes():
    connection = get_db_connection()
    with connection.cursor() as cursor:
        sql = "SELECT * FROM choferes"
        cursor.execute(sql)
        choferes = cursor.fetchall()
    connection.close()
    return jsonify(choferes)

@app.route('/api/choferes', methods=['POST'])
def add_chofer():
    data = request.json
    nombre = data.get('nombre')
    cedula = data.get('cedula')
    licencia = data.get('licencia')
    vencimiento_licencia = data.get('vencimientoLicencia')
    certificado_medico = data.get('certificadoMedico')
    vencimiento_certificado = data.get('vencimientoCertificado')
    
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = """INSERT INTO choferes (nombre, cedula, licencia, vencimiento_licencia, certificado_medico, vencimiento_certificado) 
                    VALUES (%s, %s, %s, %s, %s, %s)"""
            cursor.execute(sql, (nombre, cedula, licencia, vencimiento_licencia, certificado_medico, vencimiento_certificado))
            connection.commit()
            chofer_id = cursor.lastrowid
        connection.close()
        return jsonify({'success': True, 'id': chofer_id, 'message': 'Chofer registrado exitosamente'})
    except Exception as e:
        connection.close()
        return jsonify({'success': False, 'message': str(e)}), 500

# Vendedores
@app.route('/api/vendedores', methods=['GET'])
def get_vendedores():
    connection = get_db_connection()
    with connection.cursor() as cursor:
        sql = "SELECT * FROM vendedores"
        cursor.execute(sql)
        vendedores = cursor.fetchall()
    connection.close()
    return jsonify(vendedores)

@app.route('/api/vendedores', methods=['POST'])
def add_vendedor():
    data = request.json
    nombre = data.get('nombre')
    cedula = data.get('cedula')
    
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = """INSERT INTO vendedores (nombre, cedula) 
                    VALUES (%s, %s)"""
            cursor.execute(sql, (nombre, cedula))
            connection.commit()
            vendedor_id = cursor.lastrowid
        connection.close()
        return jsonify({'success': True, 'id': vendedor_id, 'message': 'Vendedor registrado exitosamente'})
    except Exception as e:
        connection.close()
        return jsonify({'success': False, 'message': str(e)}), 500

# Despachos
@app.route('/api/despachos', methods=['GET'])
def get_despachos():
    connection = get_db_connection()
    with connection.cursor() as cursor:
        sql = """
            SELECT d.*, c.nombre as cliente_nombre, ch.nombre as chofer_nombre, v.nombre as vendedor_nombre 
            FROM despachos d
            LEFT JOIN clientes c ON d.cliente_id = c.id
            LEFT JOIN choferes ch ON d.chofer_id = ch.id
            LEFT JOIN vendedores v ON d.vendedor_id = v.id
        """
        cursor.execute(sql)
        despachos = cursor.fetchall()
    connection.close()
    return jsonify(despachos)

@app.route('/api/despachos', methods=['POST'])
def add_despacho():
    data = request.json
    fecha = data.get('fecha')
    guia = data.get('guia')
    m3 = data.get('m3')
    resistencia = data.get('resistencia')
    cliente_id = data.get('cliente')
    chofer_id = data.get('chofer')
    vendedor_id = data.get('vendedor')
    
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = """INSERT INTO despachos (fecha, guia, m3, resistencia, cliente_id, chofer_id, vendedor_id) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s)"""
            cursor.execute(sql, (fecha, guia, m3, resistencia, cliente_id, chofer_id, vendedor_id))
            connection.commit()
            despacho_id = cursor.lastrowid
        connection.close()
        return jsonify({'success': True, 'id': despacho_id, 'message': 'Despacho registrado exitosamente'})
    except Exception as e:
        connection.close()
        return jsonify({'success': False, 'message': str(e)}), 500

# Inventario
@app.route('/api/inventario', methods=['GET'])
def get_inventario():
    connection = get_db_connection()
    with connection.cursor() as cursor:
        sql = "SELECT * FROM inventario"
        cursor.execute(sql)
        inventario = cursor.fetchall()
    connection.close()
    return jsonify(inventario)

@app.route('/api/inventario', methods=['POST'])
def add_inventario():
    data = request.json
    nombre = data.get('nombre')
    cantidad = data.get('cantidad')
    unidad = data.get('unidad')
    minimo = data.get('minimo')
    
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = """INSERT INTO inventario (nombre, cantidad, unidad, minimo) 
                    VALUES (%s, %s, %s, %s)"""
            cursor.execute(sql, (nombre, cantidad, unidad, minimo))
            connection.commit()
            item_id = cursor.lastrowid
        connection.close()
        return jsonify({'success': True, 'id': item_id, 'message': 'Item de inventario registrado exitosamente'})
    except Exception as e:
        connection.close()
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/inventario/<int:id>', methods=['PUT'])
def update_inventario(id):
    data = request.json
    nombre = data.get('nombre')
    cantidad = data.get('cantidad')
    unidad = data.get('unidad')
    minimo = data.get('minimo')
    
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = """UPDATE inventario SET nombre = %s, cantidad = %s, unidad = %s, minimo = %s 
                    WHERE id = %s"""
            cursor.execute(sql, (nombre, cantidad, unidad, minimo, id))
            connection.commit()
        connection.close()
        return jsonify({'success': True, 'message': 'Item de inventario actualizado exitosamente'})
    except Exception as e:
        connection.close()
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/inventario/<int:id>', methods=['DELETE'])
def delete_inventario(id):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = "DELETE FROM inventario WHERE id = %s"
            cursor.execute(sql, (id,))
            connection.commit()
        connection.close()
        return jsonify({'success': True, 'message': 'Item de inventario eliminado exitosamente'})
    except Exception as e:
        connection.close()
        return jsonify({'success': False, 'message': str(e)}), 500

# Mantenimiento
@app.route('/api/mantenimiento', methods=['GET'])
def get_mantenimiento():
    connection = get_db_connection()
    with connection.cursor() as cursor:
        sql = """
            SELECT m.*, c.placa, c.modelo 
            FROM mantenimiento m
            JOIN camiones c ON m.camion_id = c.id
        """
        cursor.execute(sql)
        mantenimientos = cursor.fetchall()
    connection.close()
    return jsonify(mantenimientos)

@app.route('/api/mantenimiento', methods=['POST'])
def add_mantenimiento():
    data = request.json
    camion_id = data.get('camion')
    fecha = data.get('fecha')
    descripcion = data.get('descripcion')
    costo = data.get('costo')
    
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = """INSERT INTO mantenimiento (camion_id, fecha, descripcion, costo) 
                    VALUES (%s, %s, %s, %s)"""
            cursor.execute(sql, (camion_id, fecha, descripcion, costo))
            connection.commit()
            mantenimiento_id = cursor.lastrowid
        connection.close()
        return jsonify({'success': True, 'id': mantenimiento_id, 'message': 'Mantenimiento registrado exitosamente'})
    except Exception as e:
        connection.close()
        return jsonify({'success': False, 'message': str(e)}), 500

# Alertas de inventario
@app.route('/api/alertas/inventario', methods=['GET'])
def get_alertas_inventario():
    connection = get_db_connection()
    with connection.cursor() as cursor:
        sql = "SELECT * FROM inventario WHERE cantidad <= minimo * 1.5"
        cursor.execute(sql)
        alertas = cursor.fetchall()
        
        # Clasificar alertas por nivel
        for alerta in alertas:
            if alerta['cantidad'] <= alerta['minimo']:
                alerta['nivel'] = 'crítico'
            else:
                alerta['nivel'] = 'bajo'
    
    connection.close()
    return jsonify(alertas)

# Alertas de mantenimiento (vencimientos próximos)
@app.route('/api/alertas/vencimientos', methods=['GET'])
def get_alertas_vencimientos():
    # Fecha actual
    hoy = datetime.now().date()
    # Fecha límite (30 días en el futuro)
    limite = hoy + timedelta(days=30)
    
    connection = get_db_connection()
    alertas = []
    
    # Verificar vencimientos de licencias
    with connection.cursor() as cursor:
        sql = "SELECT id, nombre, vencimiento_licencia FROM choferes WHERE vencimiento_licencia <= %s"
        cursor.execute(sql, (limite,))
        licencias = cursor.fetchall()
        for licencia in licencias:
            dias_restantes = (licencia['vencimiento_licencia'] - hoy).days
            alertas.append({
                'tipo': 'licencia',
                'chofer_id': licencia['id'],
                'chofer_nombre': licencia['nombre'],
                'fecha_vencimiento': licencia['vencimiento_licencia'].strftime('%Y-%m-%d'),
                'dias_restantes': dias_restantes,
                'nivel': 'crítico' if dias_restantes <= 7 else 'advertencia'
            })
    
    # Verificar vencimientos de certificados médicos
    with connection.cursor() as cursor:
        sql = "SELECT id, nombre, vencimiento_certificado FROM choferes WHERE vencimiento_certificado <= %s"
        cursor.execute(sql, (limite,))
        certificados = cursor.fetchall()
        for certificado in certificados:
            dias_restantes = (certificado['vencimiento_certificado'] - hoy).days
            alertas.append({
                'tipo': 'certificado_medico',
                'chofer_id': certificado['id'],
                'chofer_nombre': certificado['nombre'],
                'fecha_vencimiento': certificado['vencimiento_certificado'].strftime('%Y-%m-%d'),
                'dias_restantes': dias_restantes,
                'nivel': 'crítico' if dias_restantes <= 7 else 'advertencia'
            })
    
    connection.close()
    return jsonify(alertas)

# Iniciar la aplicación
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
