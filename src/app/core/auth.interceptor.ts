import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    // 1. Buscamos la llave (token) en el almacenamiento del navegador
    const token = localStorage.getItem('auth_token');

    // 2. Preparamos los encabezados para exigir siempre JSON a Laravel
    let headersConfig: any = {
        'Accept': 'application/json'
    };

    // 3. Si la llave existe, la agregamos a los encabezados
    if (token) {
        headersConfig['Authorization'] = `Bearer ${token}`;
    }

    // 4. Clonamos la petición y le pegamos nuestros encabezados
    const peticionClonada = req.clone({
        setHeaders: headersConfig
    });

    // Mandamos la petición modificada al servidor
    return next(peticionClonada);
};