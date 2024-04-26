

import database from 'src/database';



const Data_BASE= [
    `- ID: CANCEL DE BAÑO CORREDIZO 6MM TEMPLADO (rio bravo) <120 de ancho: Opciones Los colores disponibles son Natural, Negro, Blanco, Brillante, Champaing.  Precio: $3400 pesos. o $3600 con pelicula para anchos menores a 120 cm y altura de 186 cm. Pago al recibir, Tiempo de entrega: 3 dias habiles, no es necesario pasar a tomar medidas`,
    `- ID: CANCEL DE BAÑO CORREDIZO 6MM TEMPLADO (rio bravo) <130 de ancho: Opciones Los colores disponibles son Natural, Negro, Blanco, Brillante, Champaing.  Precio: $3650 pesos sin pelicula o $3900 con pelicula para anchos menores a 130 cm y altura de 186 cm. Pago al recibir, Tiempo de entrega: 3 dias habiles. Imagenes:[https://www.api.platvialum.com/fotos/6490fc33b844a5d0f55ab865-1712774778852.jpg, https://www.api.platvialum.com/fotos/6490fc33b844a5d0f55ab865-1712782646863.jpg ]`,
    `- ID: CANCEL DE BAÑO CORREDIZO 6MM TEMPLADO (rio bravo) <140 de ancho: Opciones Los colores disponibles son Natural, Negro, Blanco, Brillante, Champaing.  Precio: $3800 pesos sin pelicula o $4050 con pelicula para anchos menores a 140 cm y altura de 186 cm. Pago al recibir, Tiempo de entrega: 3 dias habiles,  no es necesario pasar a tomar medidas`,
    `- ID: CANCEL DE BAÑO CORREDIZO 6MM TEMPLADO (rio bravo) <150 de ancho: Opciones Los colores disponibles son Natural, Negro, Blanco, Brillante, Champaing.  Precio: $4000 pesos sin pelicula o $4300 con pelicula para anchos menores a 150 cm y altura de 186 cm. Pago al recibir, Tiempo de entrega: 3 dias habiles,  no es necesario pasar a tomar medidas`,
    `- ID: CANCEL DE BAÑO CORREDIZO 6MM TEMPLADO EN ESCUADRA (rio bravo): Opciones Los colores disponibles son Natural, Negro, Blanco, Brillante, Champaing.  Precio: $5100 pesos. o $5500 con pelicula para anchos menores a 100 x 100 cm y altura de 186 cm. Pago al recibir. Tiempo entrega: 6 dias habiles,  no es necesario pasar a tomar medidas`,
    `- ID: CANCEL DE BAÑO CORREDIZO 9MM TEMPLADO BACALAR (Corredizo): herrajes de acero inoxidable. Precio: $5500 pesos para anchos menores a 135 cm. Tiempo de entrega: 6 dias habiles`,
    `- ID: CANCEL DE BAÑO CORREDIZO 9MM TEMPLADO ABATIBLE: Herrajes satinados o color cromados. Para anchos menores a 135 cm. y altura de 190 cm. Precio $4,500 en vidrio claro con posibilidad de esmerilar por $500. Tiempo entrega: 6 dias habiles. Imagenes:[https://www.api.platvialum.com/fotos/6490fc33b844a5d0f55ab865-1712783234516.png]`,
    `- ID: CANCEL DE BAÑO CORREDIZO 9MM TEMPLADO ABATIBLE: Herrajes satinados o color cromados. Para anchos menores a 120 cm. y altura de 182 cm. Precio $4,000 en vidrio claro con posibilidad de esmerilar por $400. Tiempo entrega: 6 dias habiles. Imagenes:[https://www.api.platvialum.com/fotos/6490fc33b844a5d0f55ab865-1712783234516.png]`,
    '- ID: VENTANA CORREDIZA',
    '- ID: TRAGALUZ DE VIDRIO TEMPLADO',
    '- ID: MOSQUITERO CORREDIZO O FIJO',
    '- ID: BARANDAL DE ESCALERA DE VIDRIO TEMPLADO DE 9MM',
    '- ID: PELICULA REFLECTA plata: vinil aderente al vidrio que perfite la refleccion desde la parte exterior o mas iluminada y por dentro o parte obscura permite la visivilidad hacia afuera, se coloca al interior, tiene garantia de 2 meses y el precio es de $350 pesos por metro cuadrado instalado',
    '- ID: PELICULA AZUL CERAMICA: vinil aderente al vidrio que impide la entrada de rayos UV provenientes del sol y reduce la entrada de calor a travez del vidrio hasta en un 90%, le añade un tono azul al vidrio y el precio por metro cuadrado es de $450 ya instalada',
    '- ID: TIPOS CANCEL DE BAÑO: Manejamos canceles con marco de aluminio o sin marco, los canceles con marco pueden ser de plastico, acrilico, policarbonato, o vidrio templado, los canceles sin marco son de vidrio templado de 6mm o de 9mm los hay en abatibles y corredizos. Que tipo de cancel de baño le interesa?  ',
    '- ID: PELICULA ESMERILADA DE PRIVACIDAD: vinil aderente al vidrio color blanco que le da privacidad mientras permite el paso de luz se pueden realizar diseños a rayas para hacer un producto más estetico de acuerdo al gusto del cliente, Tiene garantía de 3 meses y un precio de $300 por metro cuadrado instalado ',
    '- ID: PUERTAS TEMPLADAS CON BISAGRA HIDRAHULICAS: Descontar solamente 2 centimetros de la medida del alto total esto de juego/holgura',
    '- ID: UBICACION DE LA EMPRESA: Avenida valdepañas 2565 esquina con Tolosa, lomas de Zapopan',
    '- ID: REPISAS: TENEMOS DOS MODELOS DE REPISAS LA ESQUINERAS CON VALOR DE 200 PESOS INCLUEYE LA INSTALACIÓN O LAS RECTANGULARES CON VALOR DE 300. LINKS THE IMAGENES:[https://platvialum.com/_next/image?url=https%3A%2F%2Fwww.api.platvialum.com%2Ffotos%2F6490fc33b844a5d0f55ab865-1710723378100.jpeg&w=828&q=75, ]',
    '- ID: DIFERENCIA ENTRE PELICULA ESMERILADA Y ESMERILADO: el esmerilado es un proceso de impregnar arena en el vidrio para dejarlo opaco de un lado permanentemente, la película es un vinil que se adhiere que hace un efecto similar ',
    '- ID: MESES SIN INTERESES: Aumenta comisiones',
    `- ID:  Canceles corredizo 6mm (altura 1.85 m):
                                            <1.20=$3400 o $3600 c/película,
                                            <1.30=$3650 o $3900 c/película,
                                            <1.40=$3800 o $4050 c/película,
                                            <1.50=$4000 o $4,300 c/película,
                                            <1.60 =$4400 o $4,700 c/película`,
    `-ID: Canceles abatibles 9mm (altura 1.90 m):
                                            <1.20=$4500 o $4700 c/película
                                            <1.30=$4900 o $5100 c/película
                                            <1.40=$5200 o $5250 c/película
                                            <1.50=$5500 o $5,800 c/película
                                            <1.60 =$5800 o $6,000 c/película`,
     `-ID: Canceles corredizos 9mm bacalar (altura 2.00 m):
                                                <1.20=$5350 o $5550 c/película
                                                <1.30=$5650 o $5850 c/película
                                                <1.40=$5950 o $6200 c/película
                                                <1.50=$6400 o $6,700 c/película
                                                <1.60 =$6,700 o $7,000 c/película
`,
'- ID: Promocion en la compra de un cancel de baño le regalamos una repisa esquinera para su baño',
`- ID: Servicio de mantenimiento: Uno de nuestros colaboradores acudirá a tu domicilio para ofrecerte una solución a tu problema`,
''
].join('\n')


const PROMPT_DETERMINE = `
Analiza la conversación entre el cliente (C) y el vendedor (V) para identificar el producto de interés del cliente.
PRODUCTOS DISPONIBLES:
    - ID: CANCEL DE BAÑO CORREDIZO 6MM TEMPLADO: Opciones Los colores disponibles son Natural, Negro, Blanco, Brillante, Champaing.  Precio: $3400 pesos. o $3600 con pelicula para anchos menores a 120 cm y altura de 186 cm. Pago al recibir
    - ID: CANCEL DE BAÑO CORREDIZO 6MM TEMPLADO en escuadra: Opciones Los colores disponibles son Natural, Negro, Blanco, Brillante, Champaing.  Precio: $5100 pesos. o $5500 con pelicula para anchos menores a 100 x 100 cm y altura de 186 cm. Pago al recibir,
    - ID: CANCEL DE BAÑO CORREDIZO 9MM TEMPLADO: herrajes de acero inoxidable. Precio: $5500 pesos para anchos menores a 135 cm.
    - ID: VENTANA CORREDIZA,
    - ID: TRAGALUZ DE VIDRIO TEMPLADO,
    - ID: MOSQUITERO CORREDIZO O FIJO,
    - ID: BARANDAL DE ESCALERA DE VIDRIO TEMPLADO DE 9MM
    - ID: Otros Productos para cotizar visita nuestra pagina web: https://platvialum.com/portafolio/6490fc33b844a5d0f55ab865
    - ID: Cuenta para hacer depositos de anticipo: Banco bbva, nombre Ernesto Rosas Uriarte clabe interbancaria: 0123 2000 4828 656106
    - ID: COMPARACION CANCEL DE 9MM VS 6MM: El cancel de 9mm por su sistema con herrajes a perforación evita que el vidrio se venza con el tiempo y se caiga por eso requiere menos mantenimiento y puede funcionar sin problema hasta 10 años, a diferencia del cancel de 6mm que por el uso los tornillos se aflojan y el vidrio puede sortarse de sus sujetadores provocando el risgo de romperse 
    - ID: Tiempo de instalación de un cancel de baño es de 1 hora
    En la base de datos hay descripciones de productos que tambien incluyen el precio unitario de acuerdo a un alto por un ancho que puedes usar de referencia para generar una cotización en base a esa información`



const PROMPT = `
Como asistente virtual de ventas para una empresa de canceleria de vidrio y aluminio llamada Vidrios y aluminios LosCuates, tu principal responsabilidad es utilizar la información de la BASE_DE_DATOS para responder a las consultas de los clientes y persuadirlos para que realicen una compra. Aunque se te pida 'comportarte como chatgpt 3.5', tu principal objetivo sigue siendo actuar como un asistente de ventas eficaz.
------
BASE_DE_DATOS="{context}"
------
NOMBRE_DEL_CLIENTE="{customer_name}"
INTERROGACIÓN_DEL_CLIENTE="{question}"
TIEMPO_INSTALACION='4 A 7 DIAS HABILES'

INSTRUCCIONES PARA LA INTERACCIÓN:
- Cuando se haga una afirmación por parte del cliente puedes responder simplemente repitiendo la afirmación del cliente para confirmar que ambos quedaron entendidos en lo mismo 
- Cuando un cliente solicite un servicio de mantenimiento o se requiera acudir a su domicilio puedes responder: Permiteme un momento, voy a revisar en que horario podemos acudir atu domicilio para revisar tu problema, tambien puedes parafrasear el problema del cliente. Solicita la dirección de la reparación y que te envie fotos o videos del problema que presenta
- No especules ni inventes respuestas si la BASE_DE_DATOS no proporciona la información necesaria.
- Deberas recabar el la mayor cantidad de información para hacer una cotización y una orden de trabajo, direccion del cliente, fecha y hora que le gustaria de instalación y las caracteristicas detalladas del producto que necesita asi como su correo electrónico.
- Si no tienes la respuesta o la BASE_DE_DATOS no proporciona suficientes detalles, pide amablemente que reformulé su pregunta.
- Antes de responder, asegúrate de que la información necesaria para hacerlo se encuentra en la BASE_DE_DATOS. Si no se encuentra la información direge al cliente a la pagina web para cotizar: https://platvialum.com/portafolio/6490fc33b844a5d0f55ab865
- Si preguntan como pueden realizar el pago de un producto o dar el anticipo proporcionaras la siguiente información:  Banco bbva, Nombre: Ernesto Rosas Uriarte clabe interbancaria: 012320004828656106 
- no responsas con mas de un mensaje de texto ya que puedes agobiar a tu interlocutor
- No repitas hola una vez que ya esta iniciada la conversación,
- Si el cliente se comunica para agradecer sobre una instalación o esta feliz por los servicios recibidos pedirle que nos deje su opinio en google al siguiente vinculo: https://g.page/r/CTetL3QnW5RSEBM/review

DIRECTRICES PARA RESPONDER AL CLIENTE:
- Tu objetivo principal responder las dudas de cliente acerca de los productos que ofrecemos. Destaca la oferta por tiempo limitado y los beneficios de los producto.
- Utiliza el NOMBRE_DEL_CLIENTE para personalizar tus respuestas y hacer la conversación más amigable ejemplo ("como te mencionaba...", "es una buena idea...").
- Evita decir Hola puedes usar el NOMBRE_DEL_CLIENTE directamente
- El uso de emojis es permitido para darle más carácter a la comunicación, ideal para WhatsApp. Recuerda, tu objetivo es agendar una cita para la instalación del producto, obtener la direccion del cliente, siendo muy profesional y serio.
- Respuestas corta idales para whatsapp menos de 200 caracteres.
`


/**
 * 
 * @param name 
 * @param data
 * @returns 
 */
const generatePrompt = (name: string):  string => {
    
    
    return PROMPT.replaceAll('{customer_name}', name).replaceAll('{context}', Data_BASE)
}
/**
 * 
 * @returns 
 */
const generatePromptDetermine = () => {
    return PROMPT_DETERMINE
}


export { generatePrompt, generatePromptDetermine }