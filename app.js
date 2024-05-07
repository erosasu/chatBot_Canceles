const { createBot, createProvider, createFlow, addKeyword, EVENTS} = require('@bot-whatsapp/bot')
const  { makeInMemoryStore } =require( "@whiskeysockets/baileys");
const store = makeInMemoryStore({});
const {generatePrompt} = require('./openai/prompt')
const {run, runDetermine}= require('./openai/index')

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

const imagesFlow = addKeyword(['ver foto', 'ver imagen','ver diseño','ver ejemplos', 'ver modelo'])
        .addAnswer('Te puedo enviar imagenes solo necesito que escribas el producto del que te gustaría recibir fotografias siendo lo más especific@ posible porfavor. Si no deseas recibir imagenes escribe *cancelar*'
        ,{capture:true,}, 
        async(ctx, {state, fallBack, endFlow, flowDynamic}) => {

            if(/cancelar/i.test(ctx.body)){
                return endFlow()
            }
            producto=ctx.body
            console.log('product', producto)
            await state.update({email:ctx.body.toLowerCase()})
            try {
                const baseUrl = `${process.env.SERVER}/psi_no_auth`;
                const response = await fetchInstance(`${baseUrl}?descripcion=${producto}`);
                const imagesData = await response.json();
                let images
                images = imagesData.SimiProductImages;
                console.log(images)

                if(images.length==0){  
                    console.log('entro al fallback') 
                    return fallBack('No se encontraron imagenes para el producto solicitado, favor de ser mas especifico, para dejar de buscar imagenes escribe *cancelar*')
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



const quoteFlow = addKeyword(['quiero cotizar', 'quiero presupuesto', 'que precio tiene', 'una cotizaci', 'costo tiene'])
    .addAnswer('Para realizar una cotización precisa necesito que me proporciones la descripcion del producto con medidas ancho x alto en centimetros, si deseas recibir una lista de precios de canceles de baño escribe *lista*',{capture:true}, 
        async(ctx, {state, fallBack, endFlow}) => {
            
            if (/cancela/i.test(ctx.body)){
                console.log('Entro a finalizar flujo')
                return endFlow()
            }
            if(!/\d+.?\d? x \d+.?\d?/.test(ctx.body)&&!/lista/i.test(ctx.body)){
                return endFlow('El formato de la medida no es el correcto ingresa la descripcion mas medidas ancho x alto o escribe *cancelar* para salir de la funcion cotizar')
            }
            cotizacion.descripcion= ctx.body
            cotizacion.celular=ctx.from
            cotizacion.cliente=ctx.pushName
        })
    .addAnswer('Gracias!, Ahora necesito que me proporciones la direción o la colonia donde se haría la instalación', {capture:true},
        async(ctx, {state, fallBack, flowDynamic, endFlow})=>{

            cotizacion.domicilio=ctx.body
            await state.update({domicilio:ctx.body})
            const baseUrl = `${process.env.SERVER}/autocotizar/6490fc33b844a5d0f55ab865`;

            const response = await fetchInstance(`${baseUrl}?descripcion=${cotizacion.descripcion}&domicilio=${cotizacion.domicilio}&celular=${cotizacion.celular}&cliente=${cotizacion.cliente}`);
            if(response.status==404){
                await flowDynamic('No se ha podido cotizar con esta información instenta con tra descripcion del producto que necesitas')
            }else{
                const {conceptos, cliente, precioCliente, decripcion, noCotizacion, paymentLink}= await response.json()  
                console.log(response)
                           
                    await flowDynamic([`Coti: ${noCotizacion}\n`+`Cliente: ${cliente.nombre}\n`+`Domicilio: ${cliente.domicilio}\n`
                            +conceptos.map((concepto, index)=>`Concepto ${index+1}: ${concepto.descripcion} Importe: $${concepto.importe}\n`)
                            +`\nTotal: $${precioCliente}`+`\nLink para hacer pago: ${paymentLink}, para cancelar la compra escribe 'cancelar' `,
                            `Ahora puedes realizar el pago en el Link de arriba, una vez realizado el pago se te pedirá un correo electrónico para enviarte tu orden de trabajo con la cual puedes exigir la entrega de tus servicios o productos en la fecha que aparece en la orden de trabajo, si no recibes tu trabajo antes de la fecha acordada podemos proceder con la devolución de tu dinero` ])
            }          
    })


const flowPrincipal = addKeyword(EVENTS.WELCOME)
        .addAction(async (ctx, {state, gotoFlow, provider, flowDynamic}) => {
                
            await client.connect();
                const db = client.db("clientes_conversaciones");
                const collection = db.collection('WA_chats')
                let history=[]
                const sock = await provider.getInstance()
                let chat =  await collection.findOne({remoteJid:`${ctx.from}@s.whatsapp.net`})
                if(chat){  
                    await state.update({history:chat.messages})
                     history = state.getMyState()?.history 
                }
                
                let newHistory = (state.getMyState()?.history ?? []) 
                sock.ev.on("messages.upsert", async  ({ messages }) => {

                   console.log(messages[0].message?.extendedTextMessage)
                    const fineTuning={
                            timeStamps:messages[0].messageTimestamp,
                            role: messages[0].key.fromMe?'system':'user',
                            content: messages[0].message?.extendedTextMessage?.text||'Object',
                            weight: 1
                    }
                    if(messages[0].key.fromMe){
                        newHistory.push(fineTuning)
                    }
                    const chatSchema = ({
                        remoteJid : messages[0].key.remoteJid,
                        firstMessageTime: messages[0].messageTimestamp,
                        user:messages[0].pushName,
                        messages: [
                            fineTuning
                        ]
                    });
                        let chat= await collection.findOne({remoteJid:chatSchema.remoteJid})
                        if(chat){
                                history=chat.messages
                                chat.messages.push(fineTuning)
                                response= await collection.updateOne({ remoteJid: chatSchema.remoteJid }, { $set: { messages: chat.messages} })
                        }else{
                            try{
                                await collection.insertOne(chatSchema) 
                                     
                            }catch{
                                console.log('Ya existe un chat con este identificador')
                            }                            
              
                        }
                }); 

                if(turnOn){
                        try{
                            console.log(`[HISTORY]:`, history)
                            
                            const ai = await runDetermine(history)
                
                            console.log(`[QUE QUIERES COMPRAR:`,ai.toLowerCase())
                
                            if(ai.toLowerCase().includes('unknown')){
                                return 
                            }
                            /**..... */
                             
                            const name = ctx?.pushName ?? ''
                    
                            console.log(`[HISTORY]:`,newHistory)
                    
                            newHistory.push({
                                role: 'user',
                                content: ctx.body
                            })
                    
                            const largeResponse = await run(name, newHistory)
                            await  flowDynamic(largeResponse)
                
                            newHistory.push({
                                role: 'assistant',
                                content: largeResponse
                            })
                        
                            await state.update({history: newHistory})
                    
                        }catch(err){
                            console.log(`[ERROR]:`,err)
                        }
                    }             
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
