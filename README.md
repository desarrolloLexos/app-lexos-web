## Changelog

Para ver los cambios en cada versión del proyecto, consulta el [Changelog](CHANGELOG.md).

# angular

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.0.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

# Proyecto Angular en Firebase Hosting

Este documento describe los pasos necesarios para compilar y desplegar el proyecto Angular en Firebase Hosting.

## Pre-requisitos

- Asegúrate de tener la última versión de [Node.js](https://nodejs.org/) instalada.
- Asegúrate de tener instalado Angular CLI: `npm install -g @angular/cli`.
- Asegúrate de tener Firebase CLI instalado: `npm install -g firebase-tools`.
- Inicia sesión en Firebase CLI con: `firebase login`.

Compilar el Proyecto

Para compilar tu proyecto Angular y prepararlo para el despliegue, ejecuta el siguiente comando:

```bash
ng build --prod
```

## Configuración de Firebase

Antes de desplegar, debes tener un archivo firebase.json en la raíz de tu proyecto con la configuración correcta. Aquí hay un ejemplo de cómo debería verse:

```bash
{
  "hosting": {
    "public": "dist", // Cambia esto si tu directorio de salida es diferente
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## Desplegar en Firebase Hosting

Una vez que tu aplicación está compilada y tienes el archivo firebase.json configurado, ejecuta el siguiente comando para desplegar tu aplicación:

```bash
firebase deploy --only hosting
```
