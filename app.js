const { createBot, createProvider, createFlow, addKeyword, EVENTS} = require('@bot-whatsapp/bot')
const  { makeInMemoryStore } =require( "@whiskeysockets/baileys");
const store = makeInMemoryStore({});
const {generatePrompt} = require('./openai/prompt')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MongoAdapter = require('@bot-whatsapp/database/mongo')
const { ChatCompletionMessageParam }  =require( 'openai/resource');
const ChatGPTClass = require('./chatgpt.class');
const ChatGPTClassB = require('./chatgptB.class');

require('dotenv').config();

let fetchInstance;

const setupFetch = import('node-fetch').then(module => {
    fetchInstance = module.default;
});

let turnOn = false

const flujoOn = addKeyword('prender').addAction(()=>turnOn=true)
const flujoOff = addKeyword('apagar').addAction(()=>turnOn=false)

let cotizacion={
    descripcion:'',
    domicilio:'',
    celular:'',
    cliente:'',
}





/**
 * Declaramos las conexiones de Mongo
 */

const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(process.env.MONGO_DB_URI+process.env.MONGO_DB_NAME, { useNewUrlParser: true, useUnifiedTopology: true });

const createBotchatGPT=async ({provider, database})=>{
    return new ChatGPTClass(database, provider)
}

const ChatGPTInstance = new ChatGPTClassB()

const flowMeses= addKeyword(['MSI', 'meses sin intereses', 'formas de pago','solo efectivo ?', 'solo efectivo?'])
    .addAnswer(`Manejamos cobro con tarjeta a travez de la terminal de mercado pago la cual cobra comisiones sobre los meses a diferir su pago, le comparto la tabla de comisiones:`, 
    {media:'./tablaMeses.jpg'})

const preciosFlow= addKeyword(['lista', '4 '])
        .addAnswer(['Seleccional el cancel que deseas adquirir escribiendo su numero identificador',
            `*- ID:  Canceles corredizo 6mm (altura 1.85 m)*:
        *1.1*: <1.20=$3400 o $3600 c/película,
        *1.2*: <1.30=$3650 o $3900 c/película,
        *1.3*: <1.40=$3800 o $4050 c/película,
        *1.4*: <1.50=$4000 o $4,300 c/película,
        *1.5*: <1.60 =$4400 o $4,700 c/película`,
        `*-ID: Canceles Corredizo en escuadra 6mm:
        .8 x .8 $5000 o $5400 con pelicula,
        .9 x .9 $5400, o 5,800 con pelicula,
        1 x 1 mts = $5600 o $6000 con pelicula,`,
            `*-ID: Canceles abatibles 9mm (altura 1.90 m)*:
        *2.1*: <1.20=$4150 o $4300 c/película,
        *2.2*: <1.30=$4500 o $4700 c/película,
        *2.3*: <1.40=$4800 o $5100 c/película,
        *2.3*: <1.50=$5100 o $5,400 c/película,
        *2.4*: <1.60 =$5400 o $5,700 c/película,
        *2.5*: <1.70 =$5500 o $5,800 c/película,
        *2.6*: <1.80 =$5750 o $6,100 c/película,
        *2.7*: <1.9 =$6000 o $6,300 c/película,
        *2.8*: <2.0 =$6250 o $6,650 c/película,`,
            `*-ID: Canceles corredizos 9mm bacalar (altura 2.00 m)*:
        *3.1*: <1.20=$4850 o $5100 c/película
        *3.2*: <1.30=$5200 o $5450 c/película
        *3.3*: <1.40=$5400 o $5650 c/película
        *3.4*: <1.50=$5600 o $5,900 c/película
        *3.5*: <1.60 =$6000 o $6,400 c/película`
        ])

const flowUbicacion = addKeyword(['ubicacion',' estan ubicados', 'donde tienes tu negocio', 'tu ubicacion','tu direccion'])
                    .addAnswer('Estamos ubicados en Av. Valdepeñas 2565, esquina con Tolosa, colonia Lomas de Zapopan')
const flowvendedor = addKeyword(['atencion']).addAnswer('Espera un momento, te atenderemos lo antes posible')

const imagesFlow = addKeyword(['foto', 'imagen','diseño','ejemplos', 'modelo'])
        .addAnswer('Te puedo enviar imagenes solo necesito que escribas el producto del que te gustaría recibir fotografias siendo lo más especific@ posible porfavor. Si no deseas recibir imagenes escribe cancelar'
        ,{capture:true,}, 
        async(ctx, {state, fallBack, endFlow}) => {

            if(/cancelar/i.test(ctx.body)){
                return endFlow()
            }
            producto=ctx.body
            console.log('product', producto)
            await state.update({email:ctx.body.toLowerCase()})
        })
        .addAnswer('Estamos buscando imagenes porfavor espera...',null,
            async (ctx, {flowDynamic, fallBack, endFlow})=>{
                let contador=0
                try {
                const baseUrl = `${process.env.SERVER}/psi_no_auth`;
                const response = await fetchInstance(`${baseUrl}?descripcion=${producto}`);
                const imagesData = await response.json();
                let images=[]
                images = imagesData.SimiProductImages;

                if(images.lengh==0){   
                    console.log('no hay imagenes')
                    await state.update({email:null})
                    return endFlow('hola ')
                }         
                  
                    const flowData = images.map((image, index) => ({
                      body: image.descripcion+` Precio: $${image.precioUnitario.toLocaleString('en-US')}`,
                      media: image.imagePath,
                    }));
                  
                    await flowDynamic(flowData);
                } catch (error) {
                    console.error('Error during flowDynamic call:', error);
                    // Handle the error appropriately
                }    
             
            })


const quoteFlow = addKeyword(['cotizar', 'cotizacion', 'que precio tiene', 'cotización', 'costo'])
    .addAnswer('Para realizar una cotización precisa necesito que me proporciones la descripcion del producto con medidas ancho x alto en centimetros, si deseas recibir una lista de precios de canceles de baño escribe *lista*',{capture:true}, 
        async(ctx, {state, fallBack, endFlow}) => {
            
            if (/cancela/i.test(ctx.body)){
                console.log('Entro a finalizar flujo')
                return endFlow()
            }
            if(!/\d+.?\d? x \d+.?\d?/.test(ctx.body)&&!/lista/i.test(ctx.body)){
                return fallBack('El formato de la medida no es el correcto ingresa la descripcion mas medidas ancho x alto o escribe *cancelar* para salir de la funcion cotizar')
            }
            cotizacion.descripcion= ctx.body
            cotizacion.celular=ctx.from
            cotizacion.cliente=ctx.pushName
        })
    .addAnswer('Gracias!, Ahora necesito que me proporciones la direción o la colonia donde se haría la instalación', {capture:true},
        async(ctx, {state, fallBack})=>{

            cotizacion.domicilio=ctx.body
            await state.update({domicilio:ctx.body})

        })
        .addAnswer('Estamos generando tu cotización porfavor espera un momento', null, 
        async (ctx, {flowDynamic, state, fallBack,}) => {
            try{
            const baseUrl = `${process.env.SERVER}/autocotizar/6490fc33b844a5d0f55ab865`;

                const response = await fetchInstance(`${baseUrl}?descripcion=${cotizacion.descripcion}&domicilio=${cotizacion.domicilio}&celular=${cotizacion.celular}&cliente=${cotizacion.cliente}`);
                const {conceptos, cliente, precioCliente, decripcion, noCotizacion, paymentLink}= await response.json()  
                console.log(response)
                           
                    await flowDynamic(`Coti: ${noCotizacion}\n`+`Cliente: ${cliente.nombre}\n`+`Domicilio: ${cliente.domicilio}\n`
                            +conceptos.map((concepto, index)=>`Concepto ${index+1}: ${concepto.descripcion} Importe: $${concepto.importe}\n`)
                            +`\nTotal: $${precioCliente}`+`\nLink para hacer pago: ${paymentLink}, para cancelar la compra escribe 'cancelar' `)

            }catch{
                console.log('No se pudo cotizar')

            }
            
        }) .addAnswer(`Ahora puedes realizar el pago en el Link de arriba, 
        Te recordamos que una vez realizado el pago se te pedira un correo electronico para enviarte tu orden de
         trabajo con la cual puedes exigir la entrega de tus servicios o productos en la fecha que aparece en la 
         orden de trabajo, si no recibes tu trabajo antes de la fecha acrodada podemos procesar a devolución de tu dinero`, {capture:true},
        async(ctx, {state, fallBack, flowDynamic, endFlow})=>{
            if(ctx.body=='cancelar'){
                return endFlow()
            }

            if(/si /i.test(ctx.body)){
                await flowDynamic('Por favor realiza una tranferencia de pago a la siguiente cuenta: Banco bbva, Nombre: Ernesto Rosas Uriarte clabe interbancaria: 012320004828656106. Una vez realizado el pago favor de enviar una captura de pantalla, el trabajo se realizará en un plazo máximo de 8 días habiles de lo contrario puedes reclamar la devolución integra de tu dinero')
            }

        })

const flowPrincipal = addKeyword(EVENTS.WELCOME)
        .addAction(async (ctx, {state, gotoFlow, provider, flowDynamic}) => {
                await client.connect();
                const db = client.db("clientes_conversaciones");
                const collection = db.collection('WA_chats')
                const sock = await provider.getInstance()
                sock.ev.on("messages.upsert", async  ({ messages }) => {

                    if(messages[0].message?.extendedTextMessage?.text=='Encender'&&messages[0].key.fromMe){
                        turnOn=true
                    }
                    if(messages[0].message?.extendedTextMessage?.text=='Apagar'&&messages[0].key.fromMe){
                        turnOn=false
                    }
                    const fineTuning={
                            timeStamps:messages[0].messageTimestamp,
                            role: messages[0].key.fromMe?'system':'user',
                            content: messages[0].message?.extendedTextMessage?.text||messages[0].message,
                            weight: 1
                    }
                    console.log(messages[0])
                    console.log(ctx.pushName)
                    const chatSchema = ({
                        remoteJid : messages[0].key.remoteJid,
                        firstMessageTime: messages[0].messageTimestamp,
                        user:messages[0].pushName,
                        messages: [
                            fineTuning
                        ]
                    });
                    try{
                        let chat= await collection.findOne({remoteJid:chatSchema.remoteJid})
                        if(!chat){
                            await collection.insertOne(chatSchema)                 
                            await flowDynamic(`Gracias por comunicarte a canceles de Jalisco. Te muestro el menú de opciones:,
                            1. Para recibir imagenes de un producto en especifico escribe *foto*,
                            2. Para Cotizar con tu propia descripcion de producto y medidas escribe *cotizar*',    
                            3. Para ver lista de precios de canceles de baño escribe *lista*,
                            4. Para recibir atención de una persona porfavor escribe *atencion*`)
                            console.log('chat creado')
                        }else{
                                chat.messages.push(fineTuning)
                                await collection.updateOne({ remoteJid: chatSchema.remoteJid }, { $set: { messages: chat.messages} })
                                console.log('Chat actualizado')
                            }
                    }catch{
                        console.log('no se pudo insertar,', messages[0])

                    }
                }); 

                const history = state.getMyState()?.history
                console.log(state.getMyState())

                if(turnOn){
                    await ChatGPTInstance.handleMsgChatGPT(generatePrompt(ctx.pushName))
                    response = await ChatGPTInstance.handleMsgChatGPT(ctx.body)
                    await flowDynamic(response.text)
                }    
                           
               /* const history = (state.getMyState()?.history ?? []) as ChatCompletionMessageParam[]
                const ai = await runDetermine(history)

                console.log(`[QUE QUIERES COMPRAR:`,ai.toLowerCase())

                if(ai.toLowerCase().includes('unknown')){
                    return 
                }
                if(ai.toLowerCase().includes('chatbot')){
                    return return gotoFlow(chatbotFlow)
                }*/
        },//).addAnswer('Gracias por comunicarte, de que manera te podemos atender?', null, null, 
        [  imagesFlow, quoteFlow, flowUbicacion, flowMeses, preciosFlow, flujoOff, flujoOn])

const main = async () => {
    const adapterDB = new MongoAdapter({
        dbUri: process.env.MONGO_DB_URI,
        dbName: process.env.MONGO_DB_NAME,
    })
    const adapterFlow = createFlow([  imagesFlow, quoteFlow, flowUbicacion, flowPrincipal, flowMeses, preciosFlow, flujoOff, flujoOn, ])
    const adapterProvider = createProvider(BaileysProvider)
    
    
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
  
    QRPortalWeb()
}

main()
