import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef); // Para forzar el refresco de pantalla

  mensajes: any[] = [];
  mensajesFiltrados: any[] = [];
  //para PONER PAGINACIÓN
  paginaActual: number = 1;
  itemsPorPagina: number = 10;


  cargando: boolean = true;
  usuarioLogueado: string = 'Admin';

  // 👇 VARIABLES PARA ESTADÍSTICAS
  totalMensajes: number = 0;
  mensajesNuevos: number = 0;
  mensajesRespondidos: number = 0;

  // Control del Modal
  modalVisible: boolean = false;
  mensajeSeleccionado: any = null;
  enviandoRespuesta: boolean = false;


  ngOnInit() {
    const token = localStorage.getItem('auth_token');

    // Si no hay token, fuera al login
    if (!token || token === 'undefined') {
      this.cerrarSesion();
      return;
    }

    // Recuperar nombre del usuario logueado
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        this.usuarioLogueado = user.name || 'Admin';
      }
    } catch (e) { console.warn('Error al leer user_data'); }

    this.cargarMensajes(token);
  }

  cargarMensajes(token: string) {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get('https://api.amazonnuts.com/api/messages', { headers }).subscribe({
      next: (res: any) => {
        this.mensajes = res;
        this.mensajesFiltrados = res;
        this.cargando = false;
        this.calcularEstadisticas();
        this.cdr.detectChanges();// Forzamos a Angular a mostrar los datos
      },
      error: () => {
        this.cargando = false;
        this.cerrarSesion();
      }
    });
  }

  abrirModal(msg: any) {
    this.mensajeSeleccionado = msg;
    this.modalVisible = true;
  }

  cerrarModal() {
    this.modalVisible = false;
    this.mensajeSeleccionado = null;
  }
  //registrar personal
  // 👇 FUNCIÓN PARA ABRIR EL MODAL Y VER LOS DETALLES DEL MENSAJE
  verDetalles(mensaje: any) {
    // 1. Guardamos el mensaje al que le dimos clic en nuestra variable seleccionada
    this.mensajeSeleccionado = mensaje;

    // 2. Hacemos visible el modal
    this.modalVisible = true;

    // 3. (Opcional pero recomendado) Si el mensaje era "Nuevo" (unread), 
    // lo pasamos automáticamente a "Leído" (read) al abrirlo.
    if (mensaje.status === 'unread') {
      this.cambiarEstado(mensaje.id, 'read');
    }
  }
  //para responder el mensaje
  // 👇 NUEVA FUNCIÓN PARA ENVIAR CORREO DESDE LA APP
  enviarRespuesta(texto: string, id: number) {
    if (!texto.trim()) {
      alert('Por favor, escribe una respuesta.');
      return;
    }

    this.enviandoRespuesta = true; // Encendemos el botón de cargando
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.post(`http://localhost:8000/api/messages/${id}/reply`, { reply_message: texto }, { headers })
      .subscribe({
        next: () => {
          this.enviandoRespuesta = false;
          // Actualizamos la tabla y las estadísticas mágicamente
          const index = this.mensajes.findIndex(m => m.id === id);
          if (index !== -1) {
            this.mensajes[index].status = 'replied';
          }
          this.calcularEstadisticas();
          this.cerrarModal();
          this.cdr.detectChanges();
          alert('¡Respuesta enviada con éxito al correo del cliente!');
        },
        error: () => {
          this.enviandoRespuesta = false;
          this.cdr.detectChanges();
          alert('Hubo un error al intentar enviar el correo. Revisa tu conexión.');
        }
      });
  }
  //eliminar
  // 👇 NUEVA FUNCIÓN PARA ELIMINAR MENSAJES
  eliminarMensaje(id: number) {
    // 1. Pedimos confirmación al usuario para no borrar por accidente
    const confirmar = confirm('¿Estás seguro de que deseas eliminar esta cotización? Esta acción la quitará de tu bandeja.');

    if (confirmar) {
      const token = localStorage.getItem('auth_token');
      const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

      // 2. Le decimos a Laravel que lo borre
      this.http.delete(`http://localhost:8000/api/messages/${id}`, { headers })
        .subscribe({
          next: () => {
            // 3. Lo borramos de nuestras listas de Angular para que desaparezca al instante
            this.mensajes = this.mensajes.filter(m => m.id !== id);
            this.mensajesFiltrados = this.mensajesFiltrados.filter(m => m.id !== id);

            // 4. Actualizamos todo
            this.calcularEstadisticas();
            this.cerrarModal();
            this.cdr.detectChanges();
            alert('Mensaje eliminado con éxito. 🗑️');
          },
          error: () => {
            alert('Hubo un problema al intentar eliminar el mensaje.');
          }
        });
    }
  }

  //FILTRAR
  // 👇 NUEVA FUNCIÓN PARA EL BUSCADOR
  filtrarMensajes(event: any) {
    const termino = event.target.value.toLowerCase(); // Lo que el usuario escribe
    // Agrega esto al final de la función:
    this.paginaActual = 1;
    if (!termino) {
      // Si la caja está vacía, mostramos todos los mensajes
      this.mensajesFiltrados = [...this.mensajes];
    } else {
      // Filtramos por nombre, correo o producto
      this.mensajesFiltrados = this.mensajes.filter(m =>
        m.sender_name.toLowerCase().includes(termino) ||
        m.email.toLowerCase().includes(termino) ||
        m.product_interest.toLowerCase().includes(termino)
      );
    }
  }

  // Actualiza el estado (Leído/Respondido) en Laravel y en la lista local
  cambiarEstado(id: number, nuevoEstado: string) {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.put(`http://localhost:8000/api/messages/${id}/status`, { status: nuevoEstado }, { headers })
      .subscribe({
        next: () => {
          // Actualizamos localmente el mensaje para no tener que recargar toda la página
          const index = this.mensajes.findIndex(m => m.id === id);
          if (index !== -1) {
            this.mensajes[index].status = nuevoEstado;
          }
          this.calcularEstadisticas();
          this.cerrarModal();
          this.cdr.detectChanges();
        },
        error: () => alert('Error al actualizar estado')
      });
  }
  // 👇 FUNCIÓN PARA CALCULAR ESTADÍSTICAS
  calcularEstadisticas() {
    this.totalMensajes = this.mensajes.length;
    this.mensajesNuevos = this.mensajes.filter(m => m.status === 'unread').length;
    this.mensajesRespondidos = this.mensajes.filter(m => m.status === 'replied').length;
  }
  // 👇 FUNCIONES DE PAGINACIÓN

  // 1. Calcula cuántas páginas hay en total según los filtros
  get totalPaginas(): number {
    return Math.ceil(this.mensajesFiltrados.length / this.itemsPorPagina);
  }

  // 2. Recorta la lista de mensajes para mostrar solo los 10 correspondientes
  get mensajesMostrados(): any[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.mensajesFiltrados.slice(inicio, fin);
  }

  // 3. Permite avanzar o retroceder de página
  cambiarPagina(direccion: number) {
    this.paginaActual += direccion;
  }
  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}