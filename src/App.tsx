import * as signalR from '@microsoft/signalr';
import { useCallback, useEffect, useRef, useState } from 'react';
import { clientFactory, CribHub, hubFactory} from './generatedTypes'

export default function App(){
    const ref = useRef<CribHub|undefined>(undefined);
    const [connected, setConnected] = useState(false);
    const [receivedBroadcast, setReceivedBroadcast] = useState("");
    const sendMessageClickHandler = useCallback(async () =>{
        try{
            ref.current?.broadcast("hello");
        }catch(e){
            console.log("Error broadcasting")
        }
    },[])
    // automatic reconnect ?
    // logging

    // will probably use redux
    useEffect(() => {
        // https://learn.microsoft.com/en-us/javascript/api/@microsoft/signalr/hubconnection?view=signalr-js-latest
        const signalRConnect = async () => {
            const connection = new signalR.HubConnectionBuilder().withUrl("todo").build();
            clientFactory.crib(connection, {
                receivedBroadcast(message, clientid, claims) {
                    setReceivedBroadcast(`${message} - ${clientid} - ${claims}`);
                },
            });
            const serverProxy = hubFactory.crib(connection);
            ref.current = serverProxy;
            try{
                await connection.start();
                setConnected(true);
            }catch(e){
                // retry logic 
            }
        }

    });

    

    return <div>
        <button onClick={sendMessageClickHandler} disabled={!connected}>Send hello to SignalR service</button>
        <div>{receivedBroadcast}</div>
    </div>;
}