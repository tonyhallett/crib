import * as signalR from "@microsoft/signalr";

// dist/browser/signalr.js

// this is calling the server connection.send
interface ICribHub {
    helloServer(arg1:number): Promise<void>
}

const hubFactory = {
    cribHub(connection:signalR.HubConnection){
        return {
            helloServer:(arg1:number) => connection.send("helloServer",arg1)
                
        }
    }
}

// this is called from the server
interface ICribClient {
    helloFromServer(arg1:string) : Promise<void>
}
// will have on/off but typed as well as a dispose
interface ITypedConnection<T> {
    toggleAll(on:boolean):void
    off(toOff:keyof T):void
    on(toOn:keyof T):void
}

// called from the server
interface IClientFactory {
    // would generate with namespaces if necessary
    cribClient(connection:signalR.HubConnection, client:ICribClient): ITypedConnection<ICribClient>
}



type UntypedHandler = Parameters<signalR.HubConnection["on"]>[1];
type UntypedClient<T> = {
    [Property in keyof T]:UntypedHandler
}

class TypedConnection<T> implements ITypedConnection<T>{
    constructor(
        private untypedClient:UntypedClient<T>, 
        private connection:signalR.HubConnection,
        addHandlers:boolean = true
    ){
        if(addHandlers){
            this.addHandlers();
        }
    }  
    
    addHandlers(){
        for(const method in this.untypedClient){
            this.connection.on(method,this.untypedClient[method as keyof UntypedClient<T>]);
        }
    }
    removeHandlers(){
        for(const method in this.untypedClient){
            this.connection.off(method,this.untypedClient[method as keyof UntypedClient<T>]);
        }
    } 
    toggleAll(on:boolean){
        if(on){
            this.addHandlers();
        }else{
            this.removeHandlers();
        }
    }

    off(toOff:Extract<keyof T, string>){
        this.connection.off(toOff,this.untypedClient[toOff]);
    }

    on(toOn:Extract<keyof T, string>){
        this.connection.on(toOn,this.untypedClient[toOn]);
    }
}

const clientFactory: IClientFactory = {
    cribClient(connection: signalR.HubConnection, client: ICribClient): ITypedConnection<ICribClient> {
        const untypedClient:UntypedClient<ICribClient> = {
            helloFromServer(arg:string){
                return client.helloFromServer(arg);
            }
        }
        
        return new TypedConnection(untypedClient,connection);
    }
}



const connection = new signalR.HubConnectionBuilder()
    .withUrl("/chathub")
    .configureLogging(signalR.LogLevel.Information)
    .build();