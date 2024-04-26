const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')
const  { makeInMemoryStore } =require( "@whiskeysockets/baileys");
const store = makeInMemoryStore({});

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MongoAdapter = require('@bot-whatsapp/database/mongo')
const { ChatCompletionMessageParam}  =require( 'openai/resource');


require('dotenv')

let fetchInstance;

const setupFetch = import('node-fetch').then(module => {
    fetchInstance = module.default;
});

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
const client = new MongoClient(MONGO_DB_URI+MONGO_DB_NAME, { useNewUrlParser: true, useUnifiedTopology: true });



const imagesFlow = addKeyword(['foto', 'imagen','diseño','ejemplos', 'modelo'])
.addAnswer('Te puedo enviar imagenes solo necesito que escribas el producto del que te gustaría recibir fotografias siendo lo más especific@ posible porfavor. Si no deseas recibir imagenes escribe cancelar',{capture:true,}, 
async(ctx, {state, fallBack, endFlow}) => {

    if(/cancelar/i.test(ctx.body)){
        return endFlow()
    }
    
    producto=ctx.body

    await state.update({email:ctx.body.toLowerCase()})
})
.addAnswer('Estamos buscando imagenes porfavor espera...',null,
    async (ctx, {flowDynamic, fallBack, endFlow})=>{
        let contador=0
        const baseUrl = `${process.env.SERVER}/psi_no_auth`;
        const response = await fetchInstance(`${baseUrl}?descripcion=${producto}`);
        const imagesData = await response.json();
        let images=[]
        images = imagesData.SimiProductImages;
        console.log(images)
        if(images.length==0){
            return fallBack('No pudimos encontrar ninguna imagen porfavor intenta con otra descripcion de producto siendo mas especific@')
        }
            await flowDynamic(`Te enviaré ${images.length} fotos`)
            for(let i=0;i<images.length;i++ ){
               try {
                 await flowDynamic([
                     {
                         body:images[i].descripcion,
                         media:images[i].imagePath,                     
                     }
                 ])
               } catch (error) {
                i++
                
               }
            }
        producto='';

             
    }
)


const quoteFlow = addKeyword(['cotizar', 'cotizacion', 'que precio tiene', 'cotización'])
        .addAnswer('Para realizar una cotización precisa necesito que me proporciones la descripcion del producto con medidas ancho x alto en centimetros ',{capture:true}, 
        async(ctx, {state, fallBack}) => {
         
            if(!/\d+.?\d? x \d+.?\d?/.test(ctx.body)){

                return fallBack('El formato de la medida no es el correcto ingresa la descripcion mas medidas ancho x alto')
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
        .addAnswer('Estamos generando tu cotización porfavor espera un momento')
        .addAction(async (ctx, {flowDynamic, state, fallBack,}) => {
            try{
            const baseUrl = `${process.env.SERVER}/autocotizar/6490fc33b844a5d0f55ab865`;

                const response = await fetchInstance(`${baseUrl}?descripcion=${cotizacion.descripcion}&domicilio=${cotizacion.domicilio}&celular=${cotizacion.celular}&cliente=${cotizacion.cliente}`);
                const {conceptos, cliente, precioCliente, decripcion, noCotizacion, paymentLink}= await response.json()  
                console.log(resJson)
                           
                    await flowDynamic(`Coti: ${noCotizacion}\n`+`Cliente: ${cliente.nombre}\n`+`Domicilio: ${cliente.domicilio}\n`
                            +conceptos.map((concepto, index)=>`Concepto ${index+1}: ${concepto.descripcion} Importe: $${concepto.importe}\n`)
                            +`\nTotal: $${precioCliente}`+`\nLink para hacer pago: ${paymentLink}`)

            }catch{

            }
            
        }) .addAnswer('¿Te gustaría hacer una compra por la cotización solicitada? ', {capture:true},
        async(ctx, {state, fallBack, flowDynamic})=>{

            if(/si /i.test(ctx.body)){
                await flowDynamic('Por favor realiza una tranferencia de pago a la siguiente cuenta: Banco bbva, Nombre: Ernesto Rosas Uriarte clabe interbancaria: 012320004828656106. Una vez realizado el pago favor de enviar una captura de pantalla, el trabajo se realizará en un plazo máximo de 8 días habiles de lo contrario puedes reclamar la devolución integra de tu dinero')
            }

        })

const preciosFlow= addKeyword(['lista', '4 '])
        .addAnswer(['Seleccional el cancel que deseas adquirir escribiendo su numero identificador',
            `- ID:  Canceles corredizo 6mm (altura 1.85 m):
        *1.1*: <1.20=$3400 o $3600 c/película,
        *1.2*: <1.30=$3650 o $3900 c/película,
        *1.3*: <1.40=$3800 o $4050 c/película,
        *1.4*: <1.50=$4000 o $4,300 c/película,
        *1.5*: <1.60 =$4400 o $4,700 c/película`,
            `-ID: Canceles abatibles 9mm (altura 1.90 m):
        *2.1*: <1.20=$4150 o $4300 c/película,
        *2.2*: <1.30=$4500 o $4700 c/película,
        *2.3*: <1.40=$4800 o $5100 c/película,
        *2.3*: <1.50=$5100 o $5,400 c/película,
        *2.4*: <1.60 =$5400 o $5,700 c/película,
        *2.5*: <1.70 =$5500 o $5,800 c/película,
        *2.6*: <1.80 =$5750 o $6,100 c/película,
        *2.7*: <1.9 =$6000 o $6,300 c/película,
        *2.8*: <2.0 =$6250 o $6,650 c/película,`,
            `-ID: Canceles corredizos 9mm bacalar (altura 2.00 m):
        *3.1*: <1.20=$4850 o $5100 c/película
        *3.2*: <1.30=$5200 o $5450 c/película
        *3.3*: <1.40=$5400 o $5650 c/película
        *3.4*: <1.50=$5600 o $5,900 c/película
        *3.5*: <1.60 =$6000 o $6,400 c/película`
        ],{capture:true})

const flowPrincipal = addKeyword(EVENTS.WELCOME)
        .addAction(async (ctx, {state, gotoFlow, provider}) => {
            try{
                await client.connect();
                const db = client.db("clientes_conversaciones");
                const collection = db.collection('WA_chats')
                const sock = await provider.getInstance()
                sock.ev.on("messages.upsert", async  ({ messages }) => {
            
                    const fineTuning={
                            timeStamps:messages[0].messageTimestamp,
                            role: messages[0].key.fromMe?'system':'user',
                            content: messages[0].message.extendedTextMessage?.text||'',
                            weight: 1
                    }
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
                        }else{
                            chat.messages.push(fineTuning)
                            await collection.updateOne({ remoteJid: chatSchema.remoteJid }, { $set: { messages: chat.messages } })
                        }
                    

                    }catch{
                        console.log('no se pudo insertar,', messages[0])

                    }
                });  
    
               /* const history = (state.getMyState()?.history ?? []) as ChatCompletionMessageParam[]
                const ai = await runDetermine(history)

                console.log(`[QUE QUIERES COMPRAR:`,ai.toLowerCase())

                if(ai.toLowerCase().includes('unknown')){
                    return 
                }
                if(ai.toLowerCase().includes('chatbot')){
                    return gotoFlow(chatbotFlow)
                }*/
            }catch(err){
                console.log(`[ERROR]:`,err)
                return
            }
        } ).addAnswer(['Gracias por comunicarte *Canceles de Jalisco*, a continuación te muestro el menú de opciones:',
        '1. Para recibir imagenes de un producto en especifico escribe *foto*',
        '2. Para Cotizar con tu propia descripcion de producto y medidas escribe *cotizar*',
        
        '3. Para ver lista de precios de canceles de baño escribe *lista*',
        '4. Para hablar con un vendedor escribe *Vendedor*'],null,null,[imagesFlow, quoteFlow, preciosFlow])
        /*
        .addAction(async (ctx, { flowDynamic, state }) => {
            
            try{
                const newHistory = (state.getMyState()?.history ?? []) as ChatCompletionMessageParam[]
                const name = ctx?.pushName ?? ''

                console.log(`[HISTORY]:`,newHistory)

                newHistory.push({
                    role: 'user',
                    content: ctx.body
                })

                const largeResponse = await run(name, newHistory)

                const chunks = largeResponse.split(/(?<!\d)\.\s+/g);
                for (const chunk of chunks) {
                    await flowDynamic(chunk)
                }

                newHistory.push({
                    role: 'assistant',
                    content: largeResponse
                })
            
                await state.update({history: newHistory})

            }catch(err){
                console.log(`[ERROR]:`,err)
            }
        })*/

        

const main = async () => {
    const adapterDB = new MongoAdapter({
        dbUri: MONGO_DB_URI,
        dbName: MONGO_DB_NAME,
    })
    const adapterFlow = createFlow([ flowPrincipal])
    const adapterProvider = createProvider(BaileysProvider)
    
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
  
    QRPortalWeb()
}

main()
