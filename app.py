from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify, send_from_directory
from flask_mail import Mail, Message
import pymysql
import random
import string
import os
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
import json

app = Flask(__name__, static_folder='static', template_folder='templates')
app.secret_key = "prealca_secret_key_2023"

# Configuración de la base de datos MySQL (AWS RDS)
db_host = "yamanote.proxy.rlwy.net"
db_user = "root"
db_password = "IntAxhBpIcxKbxDnXGEOGDuwoljAnvxF"
db_name = "railway"
db_port = 14899

# Configuración del correo
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'fuscoriccardo11@gmail.com'
app.config['MAIL_PASSWORD'] = 'fsqa yqdg dxgh smlo'
mail = Mail(app)

# Configuración para subida de archivos
UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Materiales permitidos y sus unidades
MATERIALES_PERMITIDOS = {
  'Cemento': 'toneladas',
  'Arena': 'M3',
  'Piedra': 'M3',
  'Aditivo': 'litro',
  'Fibra': 'unidad',
  'Hydrofugo': 'saco'
}

# Mínimo fijo para todas las dosificaciones (200 m³)
MINIMO_DOSIFICACION_M3 = 200

# Diseños de concreto de PREALCA (cantidades por m³)
DISENOS_CONCRETO = {
  '180_5': {
      'nombre': '180 kgf/cm² - 5"',
      'resistencia': 180,
      'asentamiento': 5,
      'materiales': {
          'Arena': 998,  # kg -> convertir a toneladas
          'Piedra': 915,  # kg -> convertir a toneladas  
          'Cemento': 285,  # kg -> convertir a toneladas
          'Aditivo': 1.5,  # litros
          'Fibra': 0.6,  # kg -> unidades (asumiendo 1 unidad = 1 kg)
          'Hydrofugo': 0.6  # kg -> sacos (asumiendo 1 saco = 1 kg)
      }
  },
  '180_7': {
      'nombre': '180 kgf/cm² - 7"',
      'resistencia': 180,
      'asentamiento': 7,
      'materiales': {
          'Arena': 1000,
          'Piedra': 825,
          'Cemento': 290,
          'Aditivo': 2.0,
          'Fibra': 0.6,
          'Hydrofugo': 0.6
      }
  },
  '210_5': {
      'nombre': '210 kgf/cm² - 5"',
      'resistencia': 210,
      'asentamiento': 5,
      'materiales': {
          'Arena': 980,
          'Piedra': 790,
          'Cemento': 315,
          'Aditivo': 1.5,
          'Fibra': 0.6,
          'Hydrofugo': 0.6
      }
  },
  '210_7': {
      'nombre': '210 kgf/cm² - 7"',
      'resistencia': 210,
      'asentamiento': 7,
      'materiales': {
          'Arena': 1030,
          'Piedra': 740,
          'Cemento': 320,
          'Aditivo': 2.0,
          'Fibra': 0.6,
          'Hydrofugo': 0.6
      }
  },
  '250_5': {
      'nombre': '250 kgf/cm² - 5"',
      'resistencia': 250,
      'asentamiento': 5,
      'materiales': {
          'Arena': 890,
          'Piedra': 816,
          'Cemento': 325,
          'Aditivo': 1.5,
          'Fibra': 0.6,
          'Hydrofugo': 0.6
      }
  },
  '250_7': {
      'nombre': '250 kgf/cm² - 7"',
      'resistencia': 250,
      'asentamiento': 7,
      'materiales': {
          'Arena': 998,
          'Piedra': 715,
          'Cemento': 330,
          'Aditivo': 2.0,
          'Fibra': 0.6,
          'Hydrofugo': 0.6
      }
  },
  '280_5': {
      'nombre': '280 kgf/cm² - 5"',
      'resistencia': 280,
      'asentamiento': 5,
      'materiales': {
          'Arena': 990,
          'Piedra': 730,
          'Cemento': 365,
          'Aditivo': 2.5,
          'Fibra': 0.6,
          'Hydrofugo': 0.6
      }
  },
  '280_7': {
      'nombre': '280 kgf/cm² - 7"',
      'resistencia': 280,
      'asentamiento': 7,
      'materiales': {
          'Arena': 1048,
          'Piedra': 818,
          'Cemento': 375,
          'Aditivo': 3.0,
          'Fibra': 0.6,
          'Hydrofugo': 0.6
      }
  },
  '310_5': {
      'nombre': '310 kgf/cm² - 5"',
      'resistencia': 310,
      'asentamiento': 5,
      'materiales': {
          'Arena': 870,
          'Piedra': 778,
          'Cemento': 385,
          'Aditivo': 2.0,
          'Fibra': 0.6,
          'Hydrofugo': 0.6
      }
  },
  '310_7': {
      'nombre': '310 kgf/cm² - 7"',
      'resistencia': 310,
      'asentamiento': 7,
      'materiales': {
          'Arena': 900,
          'Piedra': 815,
          'Cemento': 395,
          'Aditivo': 3.0,
          'Fibra': 0.6,
          'Hydrofugo': 0.6
      }
  }
}

# Función para conectar con la base de datos
def get_db_connection():
  return pymysql.connect(host=db_host,
                         user=db_user,
                         password=db_password,
                         db=db_name,
                         port=db_port,
                         cursorclass=pymysql.cursors.DictCursor)

# Función para verificar extensiones de archivo permitidas
def allowed_file(filename):
  return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Generar código de verificación
def generar_codigo():
  return ''.join(random.choices(string.digits, k=6))

# Función para calcular inventario disponible por diseño
def calcular_inventario_disenos():
  connection = get_db_connection()
  try:
      with connection.cursor() as cursor:
          # Obtener inventario actual
          sql = "SELECT nombre, cantidad, unidad FROM inventario"
          cursor.execute(sql)
          inventario = cursor.fetchall()
          
      connection.close()
      
      # Convertir inventario a diccionario para fácil acceso
      inventario_dict = {}
      for item in inventario:
          inventario_dict[item['nombre']] = {
              'cantidad': float(item['cantidad']),
              'unidad': item['unidad']
          }
      
      # Calcular cuántos m³ se pueden producir de cada diseño
      resultados = {}
      
      for diseno_id, diseno in DISENOS_CONCRETO.items():
          m3_posibles = float('inf')  # Iniciar con infinito
          limitante = None
          
          for material, cantidad_necesaria in diseno['materiales'].items():
              if material in inventario_dict:
                  cantidad_disponible = inventario_dict[material]['cantidad']
                  
                  # Convertir cantidades a las mismas unidades
                  if material in ['Arena', 'Piedra']:
                      # Convertir kg a toneladas para comparar con M3
                      # Asumiendo densidad aproximada: Arena ~1.6 ton/m³, Piedra ~1.5 ton/m³
                      densidad = 1.6 if material == 'Arena' else 1.5
                      cantidad_necesaria_m3 = (cantidad_necesaria / 1000) / densidad
                      m3_material = cantidad_disponible / cantidad_necesaria_m3
                  elif material == 'Cemento':
                      # Convertir kg a toneladas
                      cantidad_necesaria_ton = cantidad_necesaria / 1000
                      m3_material = cantidad_disponible / cantidad_necesaria_ton
                  else:
                      # Para Aditivo, Fibra, Hydrofugo usar directamente
                      m3_material = cantidad_disponible / cantidad_necesaria
                  
                  if m3_material < m3_posibles:
                      m3_posibles = m3_material
                      limitante = material
              else:
                  # Si no hay el material en inventario, no se puede producir
                  m3_posibles = 0
                  limitante = material
                  break
          
          # Determinar estado basado en el mínimo fijo de 200 m³
          if m3_posibles == 0:
              estado = 'agotado'
              estado_texto = 'Agotado'
          elif m3_posibles < MINIMO_DOSIFICACION_M3:
              estado = 'limitado'
              estado_texto = f'Bajo Stock ({int(m3_posibles)} m³)'
          else:
              estado = 'disponible'
              estado_texto = 'Disponible'
          
          resultados[diseno_id] = {
              'nombre': diseno['nombre'],
              'm3_posibles': max(0, int(m3_posibles)) if m3_posibles != float('inf') else 0,
              'limitante': limitante,
              'estado': estado,
              'estado_texto': estado_texto,
              'minimo_requerido': MINIMO_DOSIFICACION_M3
          }
      
      return resultados
      
  except Exception as e:
      print(f"Error al calcular inventario de diseños: {str(e)}")
      return {}

# Función para descontar materiales del inventario
def descontar_materiales_inventario(diseno_id, m3_despachados):
    """
    Descuenta los materiales del inventario basado en el diseño y m³ despachados
    """
    if diseno_id not in DISENOS_CONCRETO:
        raise ValueError(f"Diseño {diseno_id} no encontrado")
    
    diseno = DISENOS_CONCRETO[diseno_id]
    connection = get_db_connection()
    
    try:
        with connection.cursor() as cursor:
            # Calcular cantidades a descontar
            descuentos = {}
            
            for material, cantidad_por_m3 in diseno['materiales'].items():
                cantidad_total = cantidad_por_m3 * m3_despachados
                
                # Convertir a las unidades correctas del inventario
                if material in ['Arena', 'Piedra']:
                    # Convertir kg a M3 usando densidades aproximadas
                    densidad = 1.6 if material == 'Arena' else 1.5  # ton/m³
                    cantidad_m3 = (cantidad_total / 1000) / densidad
                    descuentos[material] = cantidad_m3
                elif material == 'Cemento':
                    # Convertir kg a toneladas
                    cantidad_ton = cantidad_total / 1000
                    descuentos[material] = cantidad_ton
                else:
                    # Aditivo (litros), Fibra (unidades), Hydrofugo (sacos)
                    descuentos[material] = cantidad_total
            
            # Verificar que hay suficiente inventario antes de descontar
            for material, cantidad_descuento in descuentos.items():
                sql = "SELECT cantidad FROM inventario WHERE nombre = %s"
                cursor.execute(sql, (material,))
                resultado = cursor.fetchone()
                
                if not resultado:
                    raise ValueError(f"Material {material} no encontrado en inventario")
                
                cantidad_actual = float(resultado['cantidad'])
                if cantidad_actual < cantidad_descuento:
                    raise ValueError(f"Inventario insuficiente de {material}. Disponible: {cantidad_actual}, Requerido: {cantidad_descuento}")
            
            # Si llegamos aquí, hay suficiente inventario. Proceder con los descuentos
            for material, cantidad_descuento in descuentos.items():
                sql = "UPDATE inventario SET cantidad = cantidad - %s WHERE nombre = %s"
                cursor.execute(sql, (cantidad_descuento, material))
            
            connection.commit()
            return descuentos
            
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        connection.close()

# Función para generar alertas de diseños
def generar_alertas_disenos():
    resultados = calcular_inventario_disenos()
    alertas = []
    
    for diseno_id, diseno in resultados.items():
        if diseno['estado'] == 'agotado':
            alertas.append({
                'tipo': 'critico',
                'diseno': diseno['nombre'],
                'mensaje': f"⚠️ CRÍTICO: {diseno['nombre']} - No se puede producir (Material limitante: {diseno['limitante']})",
                'm3_disponibles': diseno['m3_posibles'],
                'material_limitante': diseno['limitante']
            })
        elif diseno['estado'] == 'limitado':
            alertas.append({
                'tipo': 'advertencia',
                'diseno': diseno['nombre'],
                'mensaje': f"⚠️ ADVERTENCIA: {diseno['nombre']} - Solo {diseno['m3_posibles']} m³ disponibles (Mínimo: {MINIMO_DOSIFICACION_M3} m³)",
                'm3_disponibles': diseno['m3_posibles'],
                'material_limitante': diseno['limitante']
            })
    
    return alertas

# API para obtener inventario de diseños
@app.route('/api/inventario/disenos', methods=['GET'])
def get_inventario_disenos():
  try:
      resultados = calcular_inventario_disenos()
      return jsonify(resultados)
  except Exception as e:
      return jsonify({'error': str(e)}), 500

# API para obtener alertas de diseños
@app.route('/api/alertas/disenos', methods=['GET'])
def get_alertas_disenos():
    try:
        alertas = generar_alertas_disenos()
        return jsonify(alertas)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API para obtener diseños disponibles
@app.route('/api/disenos', methods=['GET'])
def get_disenos():
    try:
        # Obtener inventario de diseños para verificar disponibilidad
        inventario_disenos = calcular_inventario_disenos()
        
        disenos_disponibles = []
        for diseno_id, diseno_info in DISENOS_CONCRETO.items():
            estado_inventario = inventario_disenos.get(diseno_id, {})
            
            disenos_disponibles.append({
                'id': diseno_id,
                'nombre': diseno_info['nombre'],
                'resistencia': diseno_info['resistencia'],
                'asentamiento': diseno_info['asentamiento'],
                'disponible': estado_inventario.get('estado', 'agotado') != 'agotado',
                'm3_disponibles': estado_inventario.get('m3_posibles', 0)
            })
        
        return jsonify(disenos_disponibles)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Rutas para servir archivos estáticos
@app.route('/static/<path:path>')
def serve_static(path):
  return send_from_directory('static', path)

# Rutas para las páginas principales
@app.route('/')
def index():
  return render_template('index.html')

@app.route('/register')
def register_page():
  return render_template('register.html')

@app.route('/verification')
def verification_page():
  return render_template('verification.html')

@app.route('/forgot-password')
def forgot_password_page():
  return render_template('forgot-password.html')

@app.route('/dashboard/<role>')
def dashboard(role):
  if 'user_id' not in session:
      flash('Debe iniciar sesión para acceder al dashboard', 'error')
      return redirect(url_for('index'))
  
  # Mapear nombres de roles a nombres de plantillas
  role_template_map = {
      'administrador': 'admin',
      'registro': 'registro',
      'ensayo': 'ensayo'
  }
  
  # Obtener el nombre de la plantilla correcto
  template_role = role_template_map.get(role, role)
  
  # Obtener datos del usuario desde la base de datos
  connection = get_db_connection()
  with connection.cursor() as cursor:
      sql = "SELECT * FROM usuarios WHERE id = %s"
      cursor.execute(sql, (session['user_id'],))
      usuario = cursor.fetchone()
  connection.close()
  
  if not usuario:
      flash('Usuario no encontrado', 'error')
      return redirect(url_for('index'))
  
  return render_template(f'dashboard_{template_role}.html', usuario=usuario)

# Rutas para la API
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
      session['user_name'] = f"{user['nombre']} {user['apellido']}"
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
  nombre = request.form.get('nombre')
  apellido = request.form.get('apellido')
  cedula = request.form.get('cedula')
  correo = request.form.get('correo')
  contrasena = request.form.get('contrasena')
  rol = request.form.get('rol')
  
  # Manejar la foto si se proporciona
  foto_path = None
  if 'foto' in request.files:
      foto = request.files['foto']
      if foto and allowed_file(foto.filename):
          filename = secure_filename(f"{cedula}_{datetime.now().strftime('%Y%m%d%H%M%S')}.{foto.filename.rsplit('.', 1)[1].lower()}")
          foto.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
          foto_path = f"/static/uploads/{filename}"
  
  codigo = generar_codigo()
  
  connection = get_db_connection()
  try:
      with connection.cursor() as cursor:
          # Verificar si el correo ya existe
          sql_check = "SELECT id FROM usuarios WHERE correo = %s"
          cursor.execute(sql_check, (correo,))
          if cursor.fetchone():
              connection.close()
              flash('El correo ya está registrado', 'error')
              return redirect(url_for('register_page'))
          
          # Insertar usuario con estado "pendiente" y sin verificación
          sql = """INSERT INTO usuarios (nombre, apellido, cedula, correo, contrasena, rol, foto, codigo_verificacion, verificado) 
                  VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 0)"""
          cursor.execute(sql, (nombre, apellido, cedula, correo, contrasena, rol, foto_path, codigo))
          connection.commit()
  except Exception as e:
      connection.close()
      flash(f'Error al registrar: {str(e)}', 'error')
      return redirect(url_for('register_page'))
  
  connection.close()
  
  # Enviar el código de verificación al correo del usuario
  try:
      msg = Message("Código de Verificación - Prealca", sender=app.config['MAIL_USERNAME'], recipients=[correo])
      msg.body = f"Tu código de verificación es: {codigo}"
      mail.send(msg)
  except Exception as e:
      flash(f'Error al enviar correo: {str(e)}', 'error')
      return redirect(url_for('register_page'))
  
  # Guardar el correo en la sesión para que pueda ser utilizado en la verificación
  session["user_email"] = correo
  
  flash('Te hemos enviado un código de verificación a tu correo.', 'info')
  return redirect(url_for('verification_page'))

@app.route('/api/verify', methods=['POST'])
def verify():
  codigo = request.form.get('codigo')
  correo = session.get("user_email")
  
  if not correo:
      flash('Sesión expirada. Regístrate nuevamente.', 'error')
      return redirect(url_for('register_page'))
  
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
      flash('Verificación exitosa. Ya puedes iniciar sesión.', 'success')
      return redirect(url_for('index'))
  else:
      connection.close()
      flash('Código incorrecto. Intenta nuevamente.', 'error')
      return redirect(url_for('verification_page'))

@app.route('/api/resend_code', methods=['POST'])
def resend_code():
  correo = session.get("user_email")
  
  if not correo:
      flash('Sesión expirada. Regístrate nuevamente.', 'error')
      return redirect(url_for('register_page'))
  
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
      flash(f'Error al enviar correo: {str(e)}', 'error')
      return redirect(url_for('verification_page'))
  
  flash('Se ha enviado un nuevo código a tu correo.', 'info')
  return redirect(url_for('verification_page'))

@app.route('/api/forgot_password', methods=['POST'])
def forgot_password():
  email = request.form.get('email')
  
  connection = get_db_connection()
  with connection.cursor() as cursor:
      # Verificar si el correo existe
      sql = "SELECT id FROM usuarios WHERE correo = %s"
      cursor.execute(sql, (email,))
      user = cursor.fetchone()
  
  if not user:
      connection.close()
      flash('Si el correo existe, recibirás instrucciones para recuperar tu contraseña.', 'info')
      return redirect(url_for('forgot_password_page'))
  
  # Generar un token de recuperación
  token = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
  expiry = datetime.now() + timedelta(hours=1)
  
  with connection.cursor() as cursor:
      # Guardar el token en la base de datos
      sql = "UPDATE usuarios SET reset_token = %s, reset_token_expiry = %s WHERE id = %s"
      cursor.execute(sql, (token, expiry, user['id']))
      connection.commit()
  
  connection.close()
  
  # Enviar correo con enlace de recuperación
  try:
      reset_link = f"{request.host_url}reset_password?token={token}"
      msg = Message("Recuperación de Contraseña - Prealca", sender=app.config['MAIL_USERNAME'], recipients=[email])
      msg.body = f"Para recuperar tu contraseña, haz clic en el siguiente enlace (válido por 1 hora): {reset_link}"
      mail.send(msg)
  except Exception as e:
      flash(f'Error al enviar correo: {str(e)}', 'error')
      return redirect(url_for('forgot_password_page'))
  
  flash('Se han enviado instrucciones a tu correo para recuperar tu contraseña.', 'info')
  return redirect(url_for('index'))

@app.route('/reset_password', methods=['GET', 'POST'])
def reset_password():
  token = request.args.get('token')
  
  if not token:
      flash('Token inválido o expirado.', 'error')
      return redirect(url_for('index'))
  
  if request.method == 'POST':
      new_password = request.form.get('new_password')
      confirm_password = request.form.get('confirm_password')
      
      if new_password != confirm_password:
          flash('Las contraseñas no coinciden.', 'error')
          return render_template('reset_password.html', token=token)
      
      connection = get_db_connection()
      with connection.cursor() as cursor:
          # Verificar si el token es válido y no ha expirado
          sql = "SELECT id FROM usuarios WHERE reset_token = %s AND reset_token_expiry > %s"
          cursor.execute(sql, (token, datetime.now()))
          user = cursor.fetchone()
          
          if not user:
              connection.close()
              flash('Token inválido o expirado.', 'error')
              return redirect(url_for('index'))
          
          # Actualizar la contraseña y limpiar el token
          sql = "UPDATE usuarios SET contrasena = %s, reset_token = NULL, reset_token_expiry = NULL WHERE id = %s"
          cursor.execute(sql, (new_password, user['id']))
          connection.commit()
      
      connection.close()
      flash('Tu contraseña ha sido actualizada. Ya puedes iniciar sesión.', 'success')
      return redirect(url_for('index'))
  
  return render_template('reset_password.html', token=token)

@app.route('/api/logout', methods=['POST'])
def logout():
  session.clear()
  return jsonify({'success': True})

# API para clientes
@app.route('/api/clientes', methods=['GET'])
def get_clientes():
  connection = get_db_connection()
  with connection.cursor() as cursor:
      sql = """
          SELECT c.*, v.nombre as vendedor_nombre 
          FROM clientes c
          LEFT JOIN vendedores v ON c.vendedor_id = v.id
      """
      cursor.execute(sql)
      clientes = cursor.fetchall()
  connection.close()
  return jsonify(clientes)

@app.route('/api/clientes', methods=['POST'])
def add_cliente():
  nombre = request.form.get('nombre')
  direccion = request.form.get('direccion')
  telefono = request.form.get('telefono')
  documento = request.form.get('documento')
  vendedor_id = request.form.get('vendedor')
  
  # Validar formato del documento (debe ser V-xxxxxxxx o J-xxxxxxxx)
  if not documento or not (documento.startswith('V-') or documento.startswith('J-')):
      flash('Error: El documento debe tener el formato V-xxxxxxxx o J-xxxxxxxx', 'error')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
  
  connection = get_db_connection()
  try:
      # Verificar si ya existe un cliente con el mismo nombre
      with connection.cursor() as cursor:
          sql = "SELECT id FROM clientes WHERE nombre = %s"
          cursor.execute(sql, (nombre,))
          existing_cliente = cursor.fetchone()
          
          if existing_cliente:
              connection.close()
              flash(f'Error: Ya existe un cliente con el nombre {nombre}', 'error')
              return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
      
      # Verificar si ya existe un cliente con el mismo teléfono
      with connection.cursor() as cursor:
          sql = "SELECT id FROM clientes WHERE telefono = %s"
          cursor.execute(sql, (telefono,))
          existing_cliente = cursor.fetchone()
          
          if existing_cliente:
              connection.close()
              flash(f'Error: Ya existe un cliente con el teléfono {telefono}', 'error')
              return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
      
      # Verificar si ya existe un cliente con el mismo documento
      with connection.cursor() as cursor:
          sql = "SELECT id FROM clientes WHERE documento = %s"
          cursor.execute(sql, (documento,))
          existing_cliente = cursor.fetchone()
          
          if existing_cliente:
              connection.close()
              flash(f'Error: Ya existe un cliente con el documento {documento}', 'error')
              return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
      
      with connection.cursor() as cursor:
          sql = """INSERT INTO clientes (nombre, direccion, telefono, documento, vendedor_id) 
                  VALUES (%s, %s, %s, %s, %s)"""
          cursor.execute(sql, (nombre, direccion, telefono, documento, vendedor_id))
          connection.commit()
      connection.close()
      flash('Cliente registrado exitosamente', 'success')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
  except Exception as e:
      connection.close()
      flash(f'Error al registrar cliente: {str(e)}', 'error')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))

@app.route('/api/clientes/<int:id>', methods=['GET'])
def get_cliente_by_id(id):
  connection = get_db_connection()
  try:
      with connection.cursor() as cursor:
          sql = "SELECT * FROM clientes WHERE id = %s"
          cursor.execute(sql, (id,))
          cliente = cursor.fetchone()
          
      connection.close()
      
      if cliente:
          # Convertir a un formato serializable si es necesario
          cliente_serializable = {
              'id': cliente['id'],
              'nombre': cliente['nombre'],
              'direccion': cliente['direccion'],
              'telefono': cliente['telefono'],
              'documento': cliente['documento'],
              'vendedor_id': cliente['vendedor_id']
          }
          return jsonify(cliente_serializable)
      else:
          return jsonify({"error": "Cliente no encontrado"}), 404
  except Exception as e:
      connection.close()
      print(f"Error al obtener cliente: {str(e)}")
      return jsonify({"error": str(e)}), 500

@app.route('/api/clientes/<int:id>', methods=['POST'])
def update_cliente_by_id(id):
  nombre = request.form.get('nombre')
  direccion = request.form.get('direccion')
  telefono = request.form.get('telefono')
  documento = request.form.get('documento')
  vendedor_id = request.form.get('vendedor')
  
  # Validar formato del documento (debe ser V-xxxxxxxx o J-xxxxxxxx)
  if not documento or not (documento.startswith('V-') or documento.startswith('J-')):
      flash('Error: El documento debe tener el formato V-xxxxxxxx o J-xxxxxxxx', 'error')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
  
  connection = get_db_connection()
  try:
      # Verificar si el nombre ya existe en otro cliente
      with connection.cursor() as cursor:
          sql = "SELECT id FROM clientes WHERE nombre = %s AND id != %s"
          cursor.execute(sql, (nombre, id))
          existing_cliente = cursor.fetchone()
          
          if existing_cliente:
              connection.close()
              flash(f'Error: Ya existe otro cliente con el nombre {nombre}', 'error')
              return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
      
      # Verificar si el teléfono ya existe en otro cliente
      with connection.cursor() as cursor:
          sql = "SELECT id FROM clientes WHERE telefono = %s AND id != %s"
          cursor.execute(sql, (telefono, id))
          existing_cliente = cursor.fetchone()
          
          if existing_cliente:
              connection.close()
              flash(f'Error: Ya existe otro cliente con el teléfono {telefono}', 'error')
              return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
      
      # Verificar si el documento ya existe en otro cliente
      with connection.cursor() as cursor:
          sql = "SELECT id FROM clientes WHERE documento = %s AND id != %s"
          cursor.execute(sql, (documento, id))
          existing_cliente = cursor.fetchone()
          
          if existing_cliente:
              connection.close()
              flash(f'Error: El documento {documento} ya le pertenece a otro cliente', 'error')
              return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
      
      with connection.cursor() as cursor:
          sql = """UPDATE clientes SET nombre = %s, direccion = %s, telefono = %s, documento = %s, vendedor_id = %s 
                  WHERE id = %s"""
          cursor.execute(sql, (nombre, direccion, telefono, documento, vendedor_id, id))
          connection.commit()
      connection.close()
      flash('Cliente actualizado exitosamente', 'success')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
  except Exception as e:
      connection.close()
      flash(f'Error al actualizar cliente: {str(e)}', 'error')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))

@app.route('/api/clientes/delete/<int:id>', methods=['POST'])
def delete_cliente_by_id(id):
  connection = get_db_connection()
  try:
      # Verificar si hay despachos asociados a este cliente
      with connection.cursor() as cursor:
          sql = "SELECT COUNT(*) as count FROM despachos WHERE cliente_id = %s"
          cursor.execute(sql, (id,))
          result = cursor.fetchone()
          if result and result['count'] > 0:
              connection.close()
              flash('No se puede eliminar el cliente porque tiene despachos asociados', 'error')
              return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
      
      # Si no hay despachos, eliminar el cliente
      with connection.cursor() as cursor:
          sql = "DELETE FROM clientes WHERE id = %s"
          cursor.execute(sql, (id,))
          connection.commit()
      connection.close()
      flash('Cliente eliminado exitosamente', 'success')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
  except Exception as e:
      connection.close()
      flash(f'Error al eliminar cliente: {str(e)}', 'error')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))

# API para camiones
@app.route('/api/camiones', methods=['GET'])
def get_camiones():
  connection = get_db_connection()
  with connection.cursor() as cursor:
      sql = "SELECT * FROM camiones"
      cursor.execute(sql)
      camiones = cursor.fetchall()
  connection.close()
  return jsonify(camiones)

@app.route('/api/camiones/<int:id>', methods=['GET'])
def get_camion(id):
  connection = get_db_connection()
  try:
      with connection.cursor() as cursor:
          sql = "SELECT * FROM camiones WHERE id = %s"
          cursor.execute(sql, (id,))
          camion = cursor.fetchone()
      connection.close()
      if camion:
          return jsonify(camion)
      else:
          return jsonify({"error": "Camión no encontrado"}), 404
  except Exception as e:
      connection.close()
      return jsonify({"error": str(e)}), 500

@app.route('/api/camiones', methods=['POST'])
def add_camion():
  marca = request.form.get('marca')
  modelo = request.form.get('modelo')
  placa = request.form.get('placa')
  capacidad = request.form.get('capacidad')
  estado = request.form.get('estado', 'Activo')
  
  connection = get_db_connection()
  try:
      # Verificar si la placa ya existe
      with connection.cursor() as cursor:
          sql = "SELECT id FROM camiones WHERE placa = %s"
          cursor.execute(sql, (placa,))
          existing_camion = cursor.fetchone()
          
          if existing_camion:
              connection.close()
              flash(f'Error: El número de placa {placa} ya le pertenece a otro camión', 'error')
              return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
      
      with connection.cursor() as cursor:
          sql = """INSERT INTO camiones (marca, modelo, placa, capacidad, estado) 
                  VALUES (%s, %s, %s, %s, %s)"""
          cursor.execute(sql, (marca, modelo, placa, capacidad, estado))
          connection.commit()
      connection.close()
      flash('Camión registrado exitosamente', 'success')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
  except Exception as e:
      connection.close()
      flash(f'Error al registrar camión: {str(e)}', 'error')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))

@app.route('/api/camiones/<int:id>', methods=['POST'])
def update_camion(id):
  marca = request.form.get('marca')
  modelo = request.form.get('modelo')
  placa = request.form.get('placa')
  capacidad = request.form.get('capacidad')
  estado = request.form.get('estado', 'Activo')
  
  connection = get_db_connection()
  try:
      # Verificar si la placa ya existe en otro camión
      with connection.cursor() as cursor:
          sql = "SELECT id FROM camiones WHERE placa = %s AND id != %s"
          cursor.execute(sql, (placa, id))
          existing_camion = cursor.fetchone()
          
          if existing_camion:
              connection.close()
              flash(f'Error: El número de placa {placa} ya le pertenece a otro camión', 'error')
              return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
      
      with connection.cursor() as cursor:
          sql = """UPDATE camiones SET marca = %s, modelo = %s, placa = %s, capacidad = %s, estado = %s 
                  WHERE id = %s"""
          cursor.execute(sql, (marca, modelo, placa, capacidad, estado, id))
          connection.commit()
      connection.close()
      flash('Camión actualizado exitosamente', 'success')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
  except Exception as e:
      connection.close()
      flash(f'Error al actualizar camión: {str(e)}', 'error')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))

@app.route('/api/camiones/delete/<int:id>', methods=['POST'])
def delete_camion(id):
  connection = get_db_connection()
  try:
      # Verificar si hay mantenimientos asociados a este camión
      with connection.cursor() as cursor:
          sql = "SELECT COUNT(*) as count FROM mantenimiento WHERE camion_id = %s"
          cursor.execute(sql, (id,))
          result = cursor.fetchone()
          if result and result['count'] > 0:
              connection.close()
              flash('No se puede eliminar el camión porque tiene mantenimientos registrados', 'error')
              return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
      
      # Si no hay mantenimientos, eliminar el camión
      with connection.cursor() as cursor:
          sql = "DELETE FROM camiones WHERE id = %s"
          cursor.execute(sql, (id,))
          connection.commit()
      connection.close()
      flash('Camión eliminado exitosamente', 'success')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
  except Exception as e:
      connection.close()
      flash(f'Error al eliminar camión: {str(e)}', 'error')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))

# API para choferes
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
  nombre = request.form.get('nombre')
  cedula = request.form.get('cedula')
  licencia = request.form.get('licencia')
  vencimiento_licencia = request.form.get('vencimientoLicencia')
  certificado_medico = request.form.get('certificadoMedico')
  vencimiento_certificado = request.form.get('vencimientoCertificado')
  
  connection = get_db_connection()
  try:
      with connection.cursor() as cursor:
          sql = """INSERT INTO choferes (nombre, cedula, licencia, vencimiento_licencia, certificado_medico, vencimiento_certificado) 
                  VALUES (%s, %s, %s, %s, %s, %s)"""
          cursor.execute(sql, (nombre, cedula, licencia, vencimiento_licencia, certificado_medico, vencimiento_certificado))
          connection.commit()
      connection.close()
      flash('Chofer registrado exitosamente', 'success')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
  except Exception as e:
      connection.close()
      flash(f'Error al registrar chofer: {str(e)}', 'error')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))

@app.route('/api/choferes/<int:id>', methods=['GET'])
def get_chofer_by_id(id):
  connection = get_db_connection()
  try:
      with connection.cursor() as cursor:
          sql = "SELECT * FROM choferes WHERE id = %s"
          cursor.execute(sql, (id,))
          chofer = cursor.fetchone()
          
      connection.close()
      
      if chofer:
          # Convertir a un formato serializable
          chofer_serializable = {
              'id': chofer['id'],
              'nombre': chofer['nombre'],
              'cedula': chofer['cedula'],
              'licencia': chofer['licencia'],
              'vencimiento_licencia': chofer['vencimiento_licencia'].strftime('%Y-%m-%d') if chofer['vencimiento_licencia'] else None,
              'certificado_medico': chofer['certificado_medico'],
              'vencimiento_certificado': chofer['vencimiento_certificado'].strftime('%Y-%m-%d') if chofer['vencimiento_certificado'] else None
          }
          return jsonify(chofer_serializable)
      else:
          return jsonify({"error": "Chofer no encontrado"}), 404
  except Exception as e:
      connection.close()
      print(f"Error al obtener chofer: {str(e)}")
      return jsonify({"error": str(e)}), 500

@app.route('/api/choferes/<int:id>', methods=['POST'])
def update_chofer_by_id(id):
  nombre = request.form.get('nombre')
  cedula = request.form.get('cedula')
  licencia = request.form.get('licencia')
  vencimiento_licencia = request.form.get('vencimientoLicencia')
  certificado_medico = request.form.get('certificadoMedico')
  vencimiento_certificado = request.form.get('vencimientoCertificado')
  
  connection = get_db_connection()
  try:
      # Verificar si la cédula ya existe en otro chofer
      with connection.cursor() as cursor:
          sql = "SELECT id FROM choferes WHERE cedula = %s AND id != %s"
          cursor.execute(sql, (cedula, id))
          existing_chofer = cursor.fetchone()
          
          if existing_chofer:
              connection.close()
              flash(f'Error: La cédula {cedula} ya le pertenece a otro chofer', 'error')
              return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
      
      with connection.cursor() as cursor:
          sql = """UPDATE choferes SET nombre = %s, cedula = %s, licencia = %s, 
                  vencimiento_licencia = %s, certificado_medico = %s, vencimiento_certificado = %s 
                  WHERE id = %s"""
          cursor.execute(sql, (nombre, cedula, licencia, vencimiento_licencia, 
                              certificado_medico, vencimiento_certificado, id))
          connection.commit()
      connection.close()
      flash('Chofer actualizado exitosamente', 'success')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
  except Exception as e:
      connection.close()
      flash(f'Error al actualizar chofer: {str(e)}', 'error')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))

@app.route('/api/choferes/delete/<int:id>', methods=['POST'])
def delete_chofer_by_id(id):
  connection = get_db_connection()
  try:
      # Verificar si hay despachos asociados a este chofer
      with connection.cursor() as cursor:
          sql = "SELECT COUNT(*) as count FROM despachos WHERE chofer_id = %s"
          cursor.execute(sql, (id,))
          result = cursor.fetchone()
          if result and result['count'] > 0:
              connection.close()
              flash('No se puede eliminar el chofer porque tiene despachos asociados', 'error')
              return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
      
      # Si no hay despachos, eliminar el chofer
      with connection.cursor() as cursor:
          sql = "DELETE FROM choferes WHERE id = %s"
          cursor.execute(sql, (id,))
          connection.commit()
      connection.close()
      flash('Chofer eliminado exitosamente', 'success')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
  except Exception as e:
      connection.close()
      flash(f'Error al eliminar chofer: {str(e)}', 'error')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))

# API para vendedores
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
  nombre = request.form.get('nombre')
  cedula = request.form.get('cedula')
  
  connection = get_db_connection()
  try:
      with connection.cursor() as cursor:
          sql = """INSERT INTO vendedores (nombre, cedula) 
                  VALUES (%s, %s)"""
          cursor.execute(sql, (nombre, cedula))
          connection.commit()
      connection.close()
      flash('Vendedor registrado exitosamente', 'success')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
  except Exception as e:
      connection.close()
      flash(f'Error al registrar vendedor: {str(e)}', 'error')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))

@app.route('/api/vendedores/<int:id>', methods=['GET'])
def get_vendedor_by_id(id):
  connection = get_db_connection()
  try:
      with connection.cursor() as cursor:
          sql = "SELECT * FROM vendedores WHERE id = %s"
          cursor.execute(sql, (id,))
          vendedor = cursor.fetchone()
          
      connection.close()
      
      if vendedor:
          vendedor_serializable = {
              'id': vendedor['id'],
              'nombre': vendedor['nombre'],
              'cedula': vendedor['cedula']
          }
          return jsonify(vendedor_serializable)
      else:
          return jsonify({"error": "Vendedor no encontrado"}), 404
  except Exception as e:
      connection.close()
      print(f"Error al obtener vendedor: {str(e)}")
      return jsonify({"error": str(e)}), 500

@app.route('/api/vendedores/<int:id>', methods=['POST'])
def update_vendedor_by_id(id):
  nombre = request.form.get('nombre')
  cedula = request.form.get('cedula')
  
  connection = get_db_connection()
  try:
      # Verificar si la cédula ya existe en otro vendedor
      with connection.cursor() as cursor:
          sql = "SELECT id FROM vendedores WHERE cedula = %s AND id != %s"
          cursor.execute(sql, (cedula, id))
          existing_vendedor = cursor.fetchone()
          
          if existing_vendedor:
              connection.close()
              flash(f'Error: La cédula {cedula} ya le pertenece a otro vendedor', 'error')
              return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
      
      with connection.cursor() as cursor:
          sql = """UPDATE vendedores SET nombre = %s, cedula = %s 
                  WHERE id = %s"""
          cursor.execute(sql, (nombre, cedula, id))
          connection.commit()
      connection.close()
      flash('Vendedor actualizado exitosamente', 'success')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
  except Exception as e:
      connection.close()
      flash(f'Error al actualizar vendedor: {str(e)}', 'error')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))

@app.route('/api/vendedores/delete/<int:id>', methods=['POST'])
def delete_vendedor_by_id(id):
  connection = get_db_connection()
  try:
      # Verificar si hay clientes asociados a este vendedor
      with connection.cursor() as cursor:
          sql = "SELECT COUNT(*) as count FROM clientes WHERE vendedor_id = %s"
          cursor.execute(sql, (id,))
          result = cursor.fetchone()
          if result and result['count'] > 0:
              connection.close()
              flash('No se puede eliminar el vendedor porque tiene clientes asociados', 'error')
              return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
      
      # Si no hay clientes, eliminar el vendedor
      with connection.cursor() as cursor:
          sql = "DELETE FROM vendedores WHERE id = %s"
          cursor.execute(sql, (id,))
          connection.commit()
      connection.close()
      flash('Vendedor eliminado exitosamente', 'success')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
  except Exception as e:
      connection.close()
      flash(f'Error al eliminar vendedor: {str(e)}', 'error')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))

# API para despachos - MODIFICADA PARA USAR DISEÑOS
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
  fecha = request.form.get('fecha')
  guia = request.form.get('guia')
  m3 = float(request.form.get('m3'))
  diseno_id = request.form.get('diseno')  # Cambio: ahora recibimos diseño en lugar de resistencia
  cliente_id = request.form.get('cliente')
  chofer_id = request.form.get('chofer')
  vendedor_id = request.form.get('vendedor')
  
  # Validar que el diseño existe
  if diseno_id not in DISENOS_CONCRETO:
      flash(f'Error: Diseño {diseno_id} no válido', 'error')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
  
  # Verificar que hay suficiente inventario para el despacho
  try:
      inventario_disenos = calcular_inventario_disenos()
      diseno_info = inventario_disenos.get(diseno_id, {})
      
      if diseno_info.get('m3_posibles', 0) < m3:
          flash(f'Error: Inventario insuficiente para {m3} m³ del diseño {DISENOS_CONCRETO[diseno_id]["nombre"]}. Disponible: {diseno_info.get("m3_posibles", 0)} m³', 'error')
          return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
      
  except Exception as e:
      flash(f'Error al verificar inventario: {str(e)}', 'error')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
  
  connection = get_db_connection()
  try:
      # Verificar si la guía ya existe
      with connection.cursor() as cursor:
          sql = "SELECT id FROM despachos WHERE guia = %s"
          cursor.execute(sql, (guia,))
          existing_despacho = cursor.fetchone()
          
          if existing_despacho:
              connection.close()
              flash(f'Error: Ya existe un despacho con la guía {guia}', 'error')
              return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
      
      # Descontar materiales del inventario
      try:
          descuentos = descontar_materiales_inventario(diseno_id, m3)
      except ValueError as e:
          connection.close()
          flash(f'Error en inventario: {str(e)}', 'error')
          return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
      
      # Registrar el despacho
      with connection.cursor() as cursor:
          # Guardar el nombre del diseño en lugar de solo la resistencia
          diseno_nombre = DISENOS_CONCRETO[diseno_id]['nombre']
          sql = """INSERT INTO despachos (fecha, guia, m3, resistencia, cliente_id, chofer_id, vendedor_id) 
                  VALUES (%s, %s, %s, %s, %s, %s, %s)"""
          cursor.execute(sql, (fecha, guia, m3, diseno_nombre, cliente_id, chofer_id, vendedor_id))
          connection.commit()
      
      connection.close()
      
      # Crear mensaje de éxito con detalles de los descuentos
      descuentos_texto = ", ".join([f"{material}: {cantidad:.2f}" for material, cantidad in descuentos.items()])
      flash(f'Despacho registrado exitosamente. Materiales descontados: {descuentos_texto}', 'success')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
      
  except Exception as e:
      connection.close()
      flash(f'Error al registrar despacho: {str(e)}', 'error')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))

# API para inventario
@app.route('/api/inventario', methods=['GET'])
def get_inventario():
  connection = get_db_connection()
  with connection.cursor() as cursor:
      sql = "SELECT * FROM inventario"
      cursor.execute(sql)
      inventario = cursor.fetchall()
  connection.close()
  return jsonify(inventario)

@app.route('/api/inventario/<int:id>', methods=['GET'])
def get_inventario_item(id):
  connection = get_db_connection()
  try:
      with connection.cursor() as cursor:
          sql = "SELECT * FROM inventario WHERE id = %s"
          cursor.execute(sql, (id,))
          item = cursor.fetchone()
      connection.close()
      if item:
          return jsonify(item)
      else:
          return jsonify({"error": "Item no encontrado"}), 404
  except Exception as e:
      connection.close()
      return jsonify({"error": str(e)}), 500

@app.route('/api/inventario', methods=['POST'])
def add_inventario():
  nombre = request.form.get('nombre')
  cantidad = float(request.form.get('cantidad', 0))
  
  # Validar que el material sea uno de los permitidos
  if nombre not in MATERIALES_PERMITIDOS:
      flash(f'Error: Solo se permiten los siguientes materiales: {", ".join(MATERIALES_PERMITIDOS.keys())}', 'error')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
  
  # Asignar la unidad correcta según el material
  unidad = MATERIALES_PERMITIDOS[nombre]
  
  connection = get_db_connection()
  try:
      with connection.cursor() as cursor:
          # Verificar si el material ya existe
          sql = "SELECT id, cantidad FROM inventario WHERE nombre = %s"
          cursor.execute(sql, (nombre,))
          material_existente = cursor.fetchone()
          
          if material_existente:
              # Si el material ya existe, sumar la cantidad
              cantidad_actual = float(material_existente['cantidad'])
              nueva_cantidad = cantidad_actual + cantidad
              sql = "UPDATE inventario SET cantidad = %s WHERE id = %s"
              cursor.execute(sql, (nueva_cantidad, material_existente['id']))
              mensaje = f'Cantidad de {nombre} actualizada exitosamente'
          else:
              # Si el material no existe, crear un nuevo registro
              sql = """INSERT INTO inventario (nombre, cantidad, unidad) 
                      VALUES (%s, %s, %s)"""
              cursor.execute(sql, (nombre, cantidad, unidad))
              mensaje = f'Material {nombre} registrado exitosamente'
          
          connection.commit()
      connection.close()
      flash(mensaje, 'success')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
  except Exception as e:
      connection.close()
      flash(f'Error al registrar material: {str(e)}', 'error')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))

@app.route('/api/inventario/<int:id>', methods=['POST'])
def update_inventario(id):
  nombre = request.form.get('nombre')
  cantidad = float(request.form.get('cantidad', 0))
  
  # Validar que el material sea uno de los permitidos
  if nombre not in MATERIALES_PERMITIDOS:
      flash(f'Error: Solo se permiten los siguientes materiales: {", ".join(MATERIALES_PERMITIDOS.keys())}', 'error')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
  
  # Asignar la unidad correcta según el material
  unidad = MATERIALES_PERMITIDOS[nombre]
  
  connection = get_db_connection()
  try:
      with connection.cursor() as cursor:
          # Verificar si estamos cambiando el tipo de material
          sql = "SELECT nombre FROM inventario WHERE id = %s"
          cursor.execute(sql, (id,))
          item_actual = cursor.fetchone()
          
          if item_actual and item_actual['nombre'] != nombre:
              # Si estamos cambiando el tipo de material, verificar si el nuevo tipo ya existe
              sql = "SELECT id FROM inventario WHERE nombre = %s AND id != %s"
              cursor.execute(sql, (nombre, id))
              material_existente = cursor.fetchone()
              
              if material_existente:
                  # Si el nuevo tipo ya existe, sumar la cantidad al existente y eliminar el registro actual
                  sql = "SELECT cantidad FROM inventario WHERE id = %s"
                  cursor.execute(sql, (material_existente['id'],))
                  cantidad_actual = float(cursor.fetchone()['cantidad'])
                  nueva_cantidad = cantidad_actual + cantidad
                  
                  # Actualizar con la suma
                  sql = "UPDATE inventario SET cantidad = %s WHERE id = %s"
                  cursor.execute(sql, (nueva_cantidad, material_existente['id']))
                  
                  # Eliminar el registro actual
                  sql = "DELETE FROM inventario WHERE id = %s"
                  cursor.execute(sql, (id,))
                  
                  mensaje = f'Material actualizado y combinado con existente'
              else:
                  # Si el nuevo tipo no existe, actualizar el registro actual
                  sql = """UPDATE inventario SET nombre = %s, cantidad = %s, unidad = %s 
                          WHERE id = %s"""
                  cursor.execute(sql, (nombre, cantidad, unidad, id))
                  mensaje = f'Material actualizado exitosamente'
          else:
              # Si no estamos cambiando el tipo, simplemente actualizar la cantidad
              sql = """UPDATE inventario SET cantidad = %s 
                      WHERE id = %s"""
              cursor.execute(sql, (cantidad, id))
              mensaje = f'Material actualizado exitosamente'
          
          connection.commit()
      connection.close()
      flash(mensaje, 'success')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
  except Exception as e:
      connection.close()
      flash(f'Error al actualizar material: {str(e)}', 'error')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))

@app.route('/api/inventario/delete/<int:id>', methods=['POST'])
def delete_inventario(id):
  connection = get_db_connection()
  try:
      with connection.cursor() as cursor:
          sql = "DELETE FROM inventario WHERE id = %s"
          cursor.execute(sql, (id,))
          connection.commit()
      connection.close()
      flash('Item de inventario eliminado exitosamente', 'success')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
  except Exception as e:
      connection.close()
      flash(f'Error al eliminar item de inventario: {str(e)}', 'error')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))

# API para mantenimiento
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
  camion_id = request.form.get('camion')
  fecha = request.form.get('fecha')
  descripcion = request.form.get('descripcion')
  costo = request.form.get('costo')
  
  connection = get_db_connection()
  try:
      with connection.cursor() as cursor:
          sql = """INSERT INTO mantenimiento (camion_id, fecha, descripcion, costo) 
                  VALUES (%s, %s, %s, %s)"""
          cursor.execute(sql, (camion_id, fecha, descripcion, costo))
          connection.commit()
      connection.close()
      flash('Mantenimiento registrado exitosamente', 'success')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))
  except Exception as e:
      connection.close()
      flash(f'Error al registrar mantenimiento: {str(e)}', 'error')
      return redirect(url_for('dashboard', role=session.get('user_role', 'admin')))

# API para alertas de inventario
@app.route('/api/alertas/inventario', methods=['GET'])
def get_alertas_inventario():
  # Ahora las alertas se basan en los diseños, no en mínimos de materiales individuales
  alertas_disenos = generar_alertas_disenos()
  return jsonify(alertas_disenos)

# API para alertas de vencimientos
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

# Nueva ruta para servir las fotos de usuario
@app.route('/static/uploads/<path:filename>')
def serve_uploads(filename):
  return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Iniciar la aplicación
if __name__ == '__main__':
  app.run(debug=True, host='0.0.0.0', port=5000)
