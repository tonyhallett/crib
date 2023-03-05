import * as signalR from '@microsoft/signalr';
import { useEffect, useRef } from 'react';
import { clientFactory, CribHub, hubFactory} from './generatedTypes'

export default function App(){
    const ref = useRef<CribHub|undefined>(undefined)
    // automatic reconnect ?
    // logging

    // will prpbably use redux
    useEffect(() => {
        // https://learn.microsoft.com/en-us/javascript/api/@microsoft/signalr/hubconnection?view=signalr-js-latest
        const signalRConnect = async () => {
            const connection = new signalR.HubConnectionBuilder().withUrl("todo").build();
            clientFactory.crib(connection, {
                calledFromServer(serverCallingClient, intArg) {

                },
                calledFromServer2(serverCallingClient, intArg) {
                    
                },
            });
            const serverProxy = hubFactory.crib(connection);
            ref.current = serverProxy;
            try{
                //await connection.start().then ?
            }catch(e){
                // retry logic 
            }
        }

    });
    

    return <div>hello</div>;
}