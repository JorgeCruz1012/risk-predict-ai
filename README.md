# Risk Predict AI

Quiero que construyas un MVP funcional, moderno y ejecutable de una aplicación web llamada:

Agility Risk AI

Sistema de alerta temprana de incumplimiento de tareas

El sistema será un proyecto académico basado en información real anonimizada del Banco Unión y debe permitir estimar, desde el momento en que se crea una tarea, la probabilidad de que esta incumpla su fecha límite.

El objetivo principal NO es predecir tareas que ya vencieron, sino anticipar el riesgo utilizando únicamente información disponible al momento de crear o asignar la tarea.

1. CONTEXTO DEL PROYECTO

Agility es un gestor interno mediante el cual se distribuye y controla trabajo operativo entre diferentes áreas.

Cada tarea contiene información como:

fecha de creación;

fecha límite;

tipo de tarea;

proyecto;

persona que ejecutará la tarea;

persona que creó la tarea;

empresa;

puntos asignados;

título;

descripción.

Entre agosto de 2024 y noviembre de 2025 se cuenta con aproximadamente:

52.635 tareas;

233 ejecutores;

1.522 incumplimientos;

2,89 % de tareas fuera de plazo;

aproximadamente 97 % de tareas cumplidas;

aproximadamente 3 % incumplidas.

Actualmente el incumplimiento se identifica después de ocurrido.

El MVP debe transformar este esquema en un sistema preventivo.

2. OBJETIVO DEL MVP

Crear una aplicación que permita:

Importar el histórico de tareas desde Excel o CSV.

Guardar la información en una base de datos SQLite.

Preparar automáticamente las variables para Machine Learning.

Entrenar modelos de clasificación supervisada.

Estimar la probabilidad de incumplimiento de una tarea nueva.

Clasificar el riesgo como Bajo, Medio o Alto.

Mostrar qué factores están generando el riesgo.

Generar una explicación ejecutiva mediante un modelo de lenguaje.

Sugerir acciones al líder, por ejemplo:

redistribuir la tarea;

revisar la carga del ejecutor;

ampliar el plazo;

reasignar;

realizar seguimiento prioritario.

Mostrar un dashboard ejecutivo del comportamiento histórico.

El resultado debe parecer una aplicación empresarial real y no una maqueta académica básica.

3. STACK TECNOLÓGICO

Utilizar preferiblemente:

Frontend

React

TypeScript

Vite

Tailwind CSS

shadcn/ui

Lucide Icons

Recharts

Backend

Python

FastAPI

SQLAlchemy

Pydantic

Pandas

NumPy

Scikit-learn

Joblib

OpenPyXL

SHAP si resulta viable

Base de datos

SQLite.

Archivo:

data/agility.db

Machine Learning

Scikit-learn.

Modelo de lenguaje

Crear una capa desacoplada para consumir un LLM mediante API.

Utilizar variables de entorno como:

LLM_API_KEY=
LLM_MODEL=
LLM_BASE_URL=

La aplicación debe funcionar aunque no exista API Key.

Si no existe configuración del LLM, utilizar una explicación determinística generada con reglas y los factores identificados por el modelo.

Nunca bloquear el MVP porque no exista conexión con el LLM.

4. ARQUITECTURA

Crear una arquitectura similar a:

frontend/
backend/
backend/app/
backend/app/main.py
backend/app/database.py
backend/app/models/
backend/app/schemas/
backend/app/services/
backend/app/ml/
backend/app/api/
backend/data/
backend/models/
README.md
.env.example

Separar claramente:

acceso a datos;

procesamiento;

entrenamiento ML;

inferencia;

explicación;

API;

frontend.

No escribir toda la aplicación dentro de un único archivo.

5. DATASET

Las columnas originales pueden ser:

TaskId
Consecutive
Tittle
Description
DeadLine
RealDeadLine
CreatedOn
TypeTask
Project
StatusDescription
Closed
OnTime
ExecutingUser
ExecutingCompany
ActualUser
CreatorUser
CreatorCompany
PossiblePoints
PointsEarned

El sistema debe ser tolerante a pequeñas variaciones de nombres.

Por ejemplo:

Tittle debe ser interpretado como Title si fuera necesario.

6. VARIABLE OBJETIVO

Crear:

is_late

donde:

is_late = 1 cuando OnTime indique "No".

is_late = 0 cuando OnTime indique "Si".

La clase positiva que interesa detectar es:

is_late = 1

porque representa incumplimiento.

7. EVITAR DATA LEAKAGE

Este punto es CRÍTICO.

Para predecir una tarea en el momento de su creación NO utilizar como variables predictoras:

RealDeadLine

OnTime

Closed

PointsEarned

StatusDescription cuando represente estados posteriores a la creación.

Tampoco utilizar ninguna variable construida usando información que ocurrió después de CreatedOn.

Estas variables pueden utilizarse exclusivamente para construir el target, validar resultados o hacer análisis histórico.

Mostrar dentro de la pantalla del modelo una sección:

"Variables excluidas por fuga de información"

donde aparezcan las variables anteriores.

8. VARIABLES PARA MACHINE LEARNING

Usar información conocida al crear la tarea.

Variables iniciales:

CreatedOn
DeadLine
TypeTask
Project
ExecutingUser
ExecutingCompany
ActualUser
CreatorUser
CreatorCompany
PossiblePoints
Tittle
Description

Crear features adicionales:

days_available =
DeadLine - CreatedOn

creation_hour

creation_day_of_week

creation_month

creation_week

is_weekend

title_length

description_length

possible_points

task_type

project

executor

creator

9. CARGA DE TRABAJO DEL EJECUTOR

Esta es una de las variables más importantes.

Crear, cuando sea posible, variables históricas calculadas únicamente con información anterior a CreatedOn:

executor_tasks_last_7_days

executor_tasks_last_30_days

executor_open_tasks_at_creation

executor_avg_tasks_30_days

executor_historical_late_rate

executor_historical_task_count

IMPORTANTE:

No calcular estas variables utilizando información futura.

Para una tarea creada en una determinada fecha solo se pueden utilizar tareas registradas antes de ese momento.

Evitar cualquier contaminación temporal.

10. VARIABLES DEL CREADOR

Crear también:

creator_tasks_last_30_days

creator_historical_late_rate

creator_historical_task_count

Siempre respetando el criterio temporal.

11. TEXTO

Para el MVP tratar Tittle y Description inicialmente mediante:

TF-IDF

Limitar dimensionalidad para mantener el MVP ligero.

Si la implementación textual complica significativamente el sistema, implementar primero:

longitud del título;

longitud de descripción;

palabras clave básicas;

y dejar TF-IDF preparado como una opción activable.

12. PREPROCESAMIENTO

Crear un ColumnTransformer de scikit-learn.

Debe manejar:

Variables numéricas:

imputación de mediana;

escalado cuando aplique.

Variables categóricas:

imputación de valores faltantes;

OneHotEncoder(handle_unknown="ignore").

Texto:

TF-IDF cuando esté habilitado.

Todo debe estar encapsulado dentro de un Pipeline para garantizar que exactamente el mismo procesamiento utilizado durante el entrenamiento sea utilizado durante inferencia.

Guardar el pipeline completo con Joblib.

Ejemplo:

models/agility_risk_pipeline.joblib

13. DESBALANCE DE CLASES

La distribución aproximada es:

97 % cumple
3 % incumple.

Accuracy NO debe ser la métrica principal.

Por ejemplo, un modelo que predijera siempre "cumple" tendría aproximadamente 97 % de accuracy y sería inútil.

Priorizar:

Recall de is_late = 1

Precision

F1 Score

PR-AUC

ROC-AUC

Matriz de confusión

Mostrar accuracy solamente como información secundaria.

14. MODELOS

Entrenar inicialmente al menos:

Logistic Regression con:

class_weight="balanced"

Random Forest con:

class_weight="balanced"

Y si está disponible sin aumentar excesivamente la complejidad:

HistGradientBoosting

o Gradient Boosting.

Comparar los modelos.

Seleccionar automáticamente el mejor priorizando:

Recall de la clase tardía.

PR-AUC.

F1 de la clase tardía.

No seleccionar automáticamente un modelo solo porque tenga mayor accuracy.

15. VALIDACIÓN TEMPORAL

NO realizar únicamente un train_test_split aleatorio.

Dado que se trata de un problema de predicción futura, ordenar las tareas por CreatedOn.

Utilizar aproximadamente:

80 % más antiguo para entrenamiento.

20 % más reciente para validación/test.

Mostrar claramente las fechas utilizadas para train y test.

Ejemplo visual:

Entrenamiento:
Ago 2024 – Ago 2025

Validación:
Sep 2025 – Nov 2025

Las fechas deben calcularse realmente con el dataset importado.

16. UMBRAL DE ALERTA

No utilizar obligatoriamente 0.50.

Permitir modificar el threshold de clasificación.

Ejemplo:

Riesgo Bajo:
0 – 30 %

Riesgo Medio:
30 – 60 %

Riesgo Alto:
60 – 100 %

Los límites deben poder modificarse desde configuración.

El dashboard debe permitir visualizar cómo cambia:

Recall;

Precision;

número de alertas;

al modificar el threshold.

17. EXPLICABILIDAD

Por cada predicción mostrar los principales factores que elevaron o redujeron el riesgo.

Ejemplo:

Riesgo de incumplimiento: 78 %

Factores principales:

↑ Ejecutora tiene alta carga de tareas.
↑ El plazo disponible es inferior al promedio.
↑ Este tipo de tarea presenta mayor incumplimiento histórico.
↑ La ejecutora tiene 18 tareas activas.
↓ El proyecto históricamente presenta buen cumplimiento.

Si es viable utilizar SHAP.

Si SHAP presenta incompatibilidades con el modelo, crear un mecanismo alternativo de explicación mediante:

coeficientes;

feature importance;

comparación del valor contra distribuciones históricas.

Nunca mostrar una explicación inventada que no esté respaldada por datos.

18. INTEGRACIÓN CON LLM

El LLM NO debe calcular el riesgo.

El riesgo debe provenir exclusivamente del modelo ML.

El modelo de lenguaje recibe información estructurada como:

{
"risk_probability": 0.78,
"risk_level": "ALTO",
"main_factors": [...],
"days_available": 2,
"executor_open_tasks": 18,
"executor_historical_late_rate": 0.07
}

El LLM debe convertir esto en una explicación fácil de entender.

Ejemplo:

"Esta tarea presenta un riesgo alto de incumplimiento, principalmente debido al corto plazo disponible y a la carga actual del ejecutor. Se recomienda revisar la posibilidad de redistribuir actividades o ajustar el plazo antes de confirmar la asignación."

No permitir que el LLM invente información.

Prompt interno recomendado:

"Actúa como asistente de gestión operacional. Explica brevemente por qué una tarea presenta riesgo de incumplimiento utilizando exclusivamente los factores proporcionados. No inventes variables ni causas. Escribe máximo 80 palabras y termina con una acción recomendada para el líder."

19. BASE DE DATOS SQLITE

Crear las siguientes tablas.

tasks

id

task_id

consecutive

title

description

deadline

real_deadline

created_on

type_task

project

status_description

closed

on_time

executing_user

executing_company

actual_user

creator_user

creator_company

possible_points

points_earned

is_late

created_at

predictions

id

task_id

prediction_timestamp

risk_probability

risk_level

model_version

threshold

explanation

recommended_action

model_runs

id

created_at

model_name

model_version

training_rows

test_rows

recall_late

precision_late

f1_late

accuracy

roc_auc

pr_auc

threshold

training_start_date

training_end_date

test_start_date

test_end_date

settings

key

value

updated_at

20. ANONIMIZACIÓN

Debido a que existen datos personales internos:

Crear una funcionalidad que permita anonimizar usuarios.

Por ejemplo:

Laura Daniela Brito Quintero

→

Ejecutor_001

Daniela Andrea Roldan Ospina

→

Usuario_002

Mantener internamente una correspondencia si es necesaria para los cálculos.

Para el modo:

"Demo académico"

mostrar siempre los nombres anonimizados.

Nunca enviar nombres reales, títulos sensibles o descripciones completas al LLM.

La información enviada al LLM debe estar anonimizada.

21. LANDING PAGE

Crear una landing page empresarial moderna.

No utilizar un diseño infantil.

Estética:

banca;

datos;

inteligencia artificial;

tonos sobrios;

profesional;

minimalista;

responsive.

No utilizar logos oficiales del Banco Unión si no se suministran.

Puede utilizar un isotipo abstracto relacionado con datos, alertas o analítica.

22. HERO PRINCIPAL

Título:

"Anticipa los incumplimientos antes de que ocurran"

Subtítulo:

"Agility Risk AI analiza cada tarea desde el momento de su creación y estima su riesgo de incumplimiento para que los líderes puedan actuar antes del vencimiento."

Botones:

"Probar una predicción"

"Ver dashboard"

Mostrar una tarjeta visual:

Riesgo de incumplimiento

78 %

ALTO

y debajo:

"Requiere intervención"

23. LANDING — PROBLEMA

Mostrar indicadores:

52.635
Tareas analizadas

1.522
Incumplimientos

2,89 %
Tareas fuera de plazo

233
Ejecutores

Agregar mensaje:

"Hoy el incumplimiento se detecta después de ocurrido. Agility Risk AI busca anticiparlo."

24. LANDING — CÓMO FUNCIONA

Crear un flujo visual:

Nueva tarea

↓

Análisis de características

↓

Modelo de Machine Learning

↓

Probabilidad de incumplimiento

↓

Explicación mediante IA

↓

Acción del líder

Mostrar iconos apropiados.

25. LANDING — PROPUESTA DE VALOR

Tres tarjetas:

Anticipación

Detecta tareas con alto riesgo antes de su vencimiento.

Explicabilidad

Indica por qué el modelo generó la alerta.

Acción

Entrega recomendaciones al líder para gestionar el riesgo.

26. APLICACIÓN

Después de la landing debe existir un área denominada:

"Centro de Riesgo Operacional"

Menú lateral:

Dashboard

Nueva predicción

Tareas

Alertas

Modelo

Carga de datos

Configuración

27. DASHBOARD

Crear dashboard ejecutivo.

Indicadores superiores:

Tareas totales

Cumplimiento %

Tareas tardías

Alertas de alto riesgo

Recall del modelo

Precision del modelo

PR-AUC

Gráficos:

Cumplimiento mensual.

Incumplimiento por TypeTask.

Tareas por ejecutor.

Riesgo por ejecutor.

Distribución de probabilidad de riesgo.

Incumplimientos por día de la semana.

Evolución mensual del porcentaje de incumplimiento.

Agregar filtros:

Fecha

Ejecutor

Tipo de tarea

Proyecto

Nivel de riesgo

28. NUEVA PREDICCIÓN

Crear una pantalla especialmente importante denominada:

"Nueva predicción"

Formulario:

Título

Descripción

Fecha de creación

Fecha límite

Tipo de tarea

Proyecto

Ejecutor

Creador

Empresa

Puntos posibles

Botón:

"Analizar riesgo"

Al ejecutar:

Guardar o preparar la tarea.

Calcular las features.

Ejecutar pipeline ML.

Obtener predict_proba.

Clasificar riesgo.

Calcular factores explicativos.

Generar explicación.

Guardar prediction.

29. RESULTADO DE PREDICCIÓN

Mostrar una tarjeta grande:

RIESGO DE INCUMPLIMIENTO

78 %

ALTO

Utilizar un gauge o progress circular.

Mostrar:

Fecha límite

Días disponibles

Carga actual del ejecutor

Incumplimiento histórico del ejecutor

Tipo de tarea

Puntos

Después:

"¿Por qué se generó esta alerta?"

Mostrar máximo cinco factores.

Después:

"Explicación con IA"

Mostrar la explicación.

Después:

"Acción recomendada"

Ejemplo:

"Evaluar redistribución de carga o ajuste del plazo antes de confirmar la asignación."

Botones:

"Registrar alerta"

"Simular otro escenario"

30. SIMULACIÓN WHAT-IF

Incluir una característica sencilla pero de alto impacto.

Desde el resultado permitir:

"Cambiar condiciones"

Ejemplo:

Plazo original:
2 días

Simulación:
5 días

Ejecutor original:
Ejecutor_017

Simulación:
Ejecutor_032

Mostrar:

Riesgo original:
78 %

Riesgo simulado:
41 %

Diferencia:
-37 puntos porcentuales

Mensaje:

"Ampliar el plazo y redistribuir la tarea reduciría el riesgo estimado."

Esto es importante para demostrar que el sistema sirve para tomar decisiones y no solamente para predecir.

31. ALERTAS

Crear página:

"Alertas"

Tabla:

Tarea

Ejecutor

Tipo

Fecha límite

Riesgo

Nivel

Estado

Acción

Ordenar por mayor probabilidad.

Permitir filtros:

Alto

Medio

Bajo

Agregar chips visuales.

Ejemplo:

ALTO

MEDIO

BAJO

32. DETALLE DE ALERTA

Al seleccionar una tarea mostrar:

Información general

Probabilidad

Factores

Explicación

Recomendación

Fecha de generación

Versión del modelo

Crear botón:

"Marcar como gestionada"

y campo:

"Acción tomada"

Opciones:

Redistribuida

Plazo ajustado

Seguimiento

Sin acción

Otra

33. PANTALLA DEL MODELO

Crear sección:

"Desempeño del modelo"

Mostrar:

Modelo seleccionado

Versión

Fecha de entrenamiento

Cantidad de registros

Periodo de entrenamiento

Periodo de prueba

Recall tardías

Precision tardías

F1 tardías

PR-AUC

ROC-AUC

Accuracy

Mostrar matriz de confusión.

Mostrar claramente:

"Debido al desbalance 97/3, accuracy no es la métrica utilizada para seleccionar el modelo."

Crear comparación entre modelos mediante tabla.

34. FEATURES DEL MODELO

Mostrar:

Variables utilizadas

Variables derivadas

Variables excluidas por leakage

Importancia de variables

Top 10 features.

35. CARGA DE DATOS

Página:

"Carga de dataset"

Permitir:

Arrastrar Excel

Arrastrar CSV

Botón:

"Importar dataset"

Validar columnas.

Mostrar:

Filas detectadas

Columnas

Periodo

Valores faltantes

Duplicados

Ejecutores

% OnTime

% Late

Luego botón:

"Procesar dataset"

Después:

"Entrenar modelo"

Mostrar progreso por etapas:

Validando

Transformando fechas

Anonimizando

Creando features

Entrenando

Evaluando

Guardando modelo

36. FECHAS

El dataset puede tener diferentes formatos.

Ejemplos:

2024-08-23T00:00:00

8/17/2024 2:12:55 PM

Crear una función robusta para interpretar diferentes formatos de fecha.

Cuando una fecha sea inválida:

no detener toda la importación;

marcar la fila;

reportar el problema;

permitir excluirla.

37. DATOS FALTANTES

Mostrar análisis de missing values.

Para categóricas:

"Sin información"

Para variables numéricas:

mediana cuando corresponda.

No rellenar fechas críticas de manera arbitraria.

Si CreatedOn o DeadLine faltan, marcar la tarea como inválida para entrenamiento.

38. API

Crear endpoints similares a:

GET /api/health

GET /api/dashboard

GET /api/tasks

GET /api/tasks/{id}

POST /api/tasks/import

POST /api/model/train

GET /api/model/metrics

GET /api/model/features

POST /api/predict

POST /api/predict/simulate

GET /api/predictions

GET /api/predictions/{id}

PUT /api/predictions/{id}

GET /api/settings

PUT /api/settings

Documentar automáticamente mediante Swagger de FastAPI.

39. RESPUESTA API DE PREDICCIÓN

Ejemplo:

{
"task_id": "MVP-001",
"risk_probability": 0.78,
"risk_level": "HIGH",
"threshold": 0.60,
"main_factors": [
{
"feature": "days_available",
"value": 2,
"effect": "increases_risk"
},
{
"feature": "executor_open_tasks",
"value": 18,
"effect": "increases_risk"
}
],
"explanation": "La tarea presenta un riesgo alto...",
"recommended_action": "Revisar redistribución o ampliación del plazo.",
"model_version": "1.0"
}

40. DEMO SIN DATASET

La aplicación debe poder abrirse y demostrarse aunque todavía no se haya cargado Dataset Agility.xlsx.

Crear automáticamente datos sintéticos/anónimos suficientes para mostrar:

Dashboard

Nueva predicción

Alertas

Modelo

No utilizar nombres reales en los datos demo.

Agregar una etiqueta visible:

"DATOS DEMO"

Cuando se cargue el dataset real debe desaparecer esa etiqueta.

41. SEED DATA

Generar aproximadamente 200 registros ficticios coherentes.

Ejecutores:

Ejecutor_001

Ejecutor_002

...

Tipos:

Impacto

Actividad

Solicitud

Seguimiento

Proyecto:

Proyecto A

Proyecto B

Operación

Otros

Mantener aproximadamente 95-97 % OnTime para simular el desbalance real.

42. EXPERIENCIA VISUAL

Usar:

cards

tooltips

badges

tables

progress bars

skeleton loaders

empty states

toast notifications

confirmation dialogs

Diseño responsive.

Desktop como prioridad.

Buen funcionamiento también en tablet.

43. COLORES DE RIESGO

Utilizar semánticamente:

Bajo:
verde

Medio:
ámbar

Alto:
rojo

Pero mantener la interfaz general sobria y corporativa.

No saturar la aplicación de colores.

44. SEGURIDAD

El MVP NO es una aplicación productiva.

Agregar:

"Uso académico / demostrativo"

No guardar API Keys directamente en código.

Usar .env.

No enviar datos personales al LLM.

Validar archivos cargados.

Limitar extensiones a:

.xlsx
.xls
.csv

45. README

Generar README completo incluyendo:

Descripción

Arquitectura

Tecnologías

Instalación

Configuración

Variables de entorno

Ejecución frontend

Ejecución backend

Entrenamiento

Carga de dataset

Endpoints

Explicación del ML

Limitaciones del MVP

Protección de datos

Ejemplo:

Backend:

python -m venv venv

pip install -r requirements.txt

uvicorn app.main:app --reload

Frontend:

npm install

npm run dev

46. DOCKER

Si es viable, agregar:

Dockerfile frontend

Dockerfile backend

docker-compose.yml

Para poder ejecutar:

docker compose up --build

SQLite debe persistirse mediante volumen.

47. CRITERIOS DE ACEPTACIÓN

El MVP se considera terminado cuando:

La landing page funciona.

Se puede navegar al dashboard.

SQLite se crea automáticamente.

Se puede importar Excel o CSV.

Las fechas se interpretan correctamente.

Las columnas con fuga de información no entran al modelo.

Se construye la variable is_late.

Se entrena al menos LogisticRegression y RandomForest.

Existe evaluación temporal.

Se muestran Recall, Precision, F1 y PR-AUC.

Se guarda el mejor pipeline.

Se puede ingresar una nueva tarea.

La aplicación devuelve una probabilidad entre 0 y 1.

Se asigna Bajo/Medio/Alto.

Se muestran factores explicativos.

Se genera explicación ejecutiva.

Funciona sin LLM utilizando fallback local.

Las predicciones quedan guardadas en SQLite.

Existe historial de alertas.

Existe simulador what-if.

Hay datos demo para ejecutar la aplicación inmediatamente.

48. PRINCIPIOS IMPORTANTES

No construir una simple página estática.

Quiero un MVP funcional.

No utilizar OnTime, RealDeadLine o PointsEarned para predecir tareas nuevas.

Evitar data leakage.

Priorizar Recall de incumplimientos frente a Accuracy.

No permitir que el LLM sustituya al modelo de Machine Learning.

El LLM únicamente explica resultados obtenidos por el modelo.

No enviar información personal al LLM.

Mantener separación entre frontend, backend, base de datos y ML.

Crear código limpio, modular y documentado.

No dejar botones falsos.

Si una funcionalidad aparece en pantalla debe tener comportamiento real.

49. PRIMERA EXPERIENCIA DEL USUARIO

Al abrir la aplicación:

Mostrar landing.

Mostrar indicadores del problema.

Permitir seleccionar "Probar una predicción".

Abrir formulario precargado con una tarea demo.

El usuario pulsa "Analizar riesgo".

Mostrar una animación breve de análisis.

Retornar una probabilidad.

Mostrar factores.

Mostrar explicación.

Permitir simular:

mayor plazo;

otro ejecutor.

Mostrar cómo cambia el riesgo.

Esta debe ser la experiencia central de la demostración.

50. ENFOQUE DEL PRODUCTO

La aplicación debe comunicar permanentemente que:

"No buscamos explicar por qué una tarea incumplió. Buscamos detectar cuáles tienen mayor probabilidad de incumplir antes de que ocurra."

Y el concepto principal del producto debe ser:

PREDECIR → EXPLICAR → ACTUAR.

Construye ahora la aplicación completa siguiendo estas especificaciones. Antes de finalizar, ejecuta el proyecto, corrige errores de compilación y runtime, prueba la carga de datos, prueba una predicción y verifica que todos los botones principales sean funcionales.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b70a435b-8f06-4492-be6c-b37feb15aacc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
