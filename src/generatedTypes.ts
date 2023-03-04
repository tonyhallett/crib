/* eslint-disable */
// Generated from ServerlessHub<T>
import * as signalR from '@microsoft/signalr';

export type ClientCallingServer = {
    property: string;
};
export type ServerCallingClient = {
    property: string;
};
export interface CribClient {
    calledFromServer(serverCallingClient: ServerCallingClient, intArg: number): void;
}
  

export const hubFactory = {

    crib(connection:signalR.HubConnection){
        return {
           broadcast:(clientCallingServer:ClientCallingServer) => connection.send('Broadcast', clientCallingServer),
        }
    },


}


interface ITypedConnection<T> {
    toggleAll(on:boolean):void
    off(toOff:keyof T):void
    on(toOn:keyof T):void
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


export const clientFactory = {

    crib(connection:signalR.HubConnection, client: CribClient): ITypedConnection<CribClient>{
        const untypedClient:UntypedClient<CribClient> = {

            calledFromServer(serverCallingClient:ServerCallingClient, intArg:number){
                return client.calledFromServer(serverCallingClient, intArg);
            },
        }

        return new TypedConnection(untypedClient, connection);
    },

}
            
