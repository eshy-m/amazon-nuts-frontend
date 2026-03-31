import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  // ¡Tus productos reales de Amazon Nuts!
  productos = [
    {
      id: 1,
      nombre: 'Castañas Enteras',
      categoria: 'Whole',
      descripcion: 'Nueces de Brasil premium, enteras y seleccionadas con los más altos estándares.',
      imagen: 'assets/whole.jpg'
    },
    {
      id: 2,
      nombre: 'Castañas Sin Puntas',
      categoria: 'Chipped',
      descripcion: 'Castañas de alta calidad con un leve corte en las puntas, ideales para repostería o snacks.',
      imagen: 'assets/chipped.jpg'
    },
    {
      id: 3,
      nombre: 'Castañas en Trozos',
      categoria: 'Broken',
      descripcion: 'Trozos de castaña perfectos para la industria alimentaria, mix de frutos secos y cereales.',
      imagen: 'assets/broken.jpg'
    }
  ];
  //---datos de confianza, los ceritficados
  certificaciones = [
    { name: 'HACCP Certified', logo: 'assets/cert-haccp.png' },
    { name: 'Producto de Perú', logo: 'assets/cert-peru.png' } // Podríamos poner la 'Marca Perú'
  ]
  mercados = [
    { name: 'USA', logo: 'assets/usa.png' },
    { name: 'Corea del Sur', logo: 'assets/South Korea.png' },
    { name: 'Rusia', logo: 'assets/Russia.png' },
    { name: 'Polonia', logo: 'assets/Poland.png' },
    { name: 'Alemania', logo: 'assets/Germany.png' },
    { name: 'Colombia', logo: 'assets/Colombia.png' }
  ];
  // --- NUESTRO PROPÓSITO ---
  valores = [
    {
      titulo: 'Sostenibilidad',
      descripcion: 'Preservamos la biodiversidad de la Amazonía peruana mediante prácticas responsables en cada cosecha.',
      icono: '🌱'
    },
    {
      titulo: 'Impacto Social',
      descripcion: 'Generamos empleo local y promovemos el bienestar de la comunidad en Puerto Maldonado.',
      icono: '🤝'
    },
    {
      titulo: 'Calidad Premium',
      descripcion: 'Garantizamos seguridad alimentaria con estándares internacionales desde el bosque hasta su destino.',
      icono: '⭐'
    }
  ];
  // --- CALIDAD Y PROCESOS ---
  procesos = [
    {
      paso: '01',
      titulo: 'Recolección Sostenible',
      descripcion: 'Cosechamos en Madre de Dios respetando los ciclos naturales del bosque para asegurar la regeneración.',
      icono: '🌳'
    },
    {
      paso: '02',
      titulo: 'Secado y Esterilizado',
      descripcion: 'Procesos térmicos rigurosos para garantizar la inocuidad (HACCP) y niveles óptimos de humedad.',
      icono: '☀️'
    },
    {
      paso: '03',
      titulo: 'Selección y Calibrado',
      descripcion: 'Clasificamos meticulosamente por tamaño y calidad (Whole, Chipped, Broken) con tecnología avanzada.',
      icono: '🔍'
    },
    {
      paso: '04',
      titulo: 'Envasado al Vacío',
      descripcion: 'Empaque de alta barrera para preservar la frescura, el sabor y la vida útil durante la exportación.',
      icono: '📦'
    }
  ];
}
