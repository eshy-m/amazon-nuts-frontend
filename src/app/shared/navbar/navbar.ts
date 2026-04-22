import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';//para que redireccionen a las rutas

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {

}
