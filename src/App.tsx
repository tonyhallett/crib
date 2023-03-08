import * as signalR from '@microsoft/signalr';
import { useCallback, useEffect, useRef, useState } from 'react';
import functionAppPath from './functionAppPath';
import { clientFactory, CribHub, hubFactory} from './generatedTypes'
// https://learn.microsoft.com/en-us/javascript/api/@microsoft/signalr/hubconnection?view=signalr-js-latest

interface ClientPrincipal {
    identityProvider: string;
    userDetails: string;

}

const NavBar = (props:{user:ClientPrincipal}) => { 
    const {user} = props;
    // to change to provider type
    const providers = ['twitter', 'github', 'aad']; 
    /*
        Check OneNote as there is another
        <a href="/.auth/login/aad">Log in with the Microsoft Identity Platform</a>
        <a href="/.auth/login/facebook">Log in with Facebook</a>
        <a href="/.auth/login/google">Log in with Google</a>
        <a href="/.auth/login/twitter">Log in with Twitter</a>
        <a href="/.auth/login/apple">Log in with Apple</a>

    */
    const redirect = `/`; 

    return ( 
        <> 
        {!user && providers.map((provider) => ( 
            <span><a key={provider} href={`/.auth/login/${provider}?post_login_redirect_uri=${redirect}`}><h4>{provider}</h4></a> </span> 
        ))} 

        {user && ( 
            <div> 
                <p> 
                    <span>{user.userDetails + " " +  user.identityProvider}</span> 

                    <span> <a href={`/.auth/logout?post_logout_redirect_uri=${redirect}`}> 
                        Logout 
                    </a> 
                    </span> 
                </p> 
            </div> 
        )} 
        </> 
    ) 
} 


/*
    if it is not possible to use Easy Auth with a static website then will use
    https://auth0.com/pricing
*/
export default function App(){
    const ref = useRef<CribHub|undefined>(undefined);
    
    //const [isAuthenticated, setIsAuthenticated] = useState(false); 
    //const [user, setUser] = useState<ClientPrincipal|undefined>(); 
    
    const [connected, setConnected] = useState(false);
    const [receivedBroadcast, setReceivedBroadcast] = useState("");
    const sendMessageClickHandler = useCallback(async () =>{
        try{
            ref.current?.broadcast("hello");
        }catch(e){
            console.log("Error broadcasting")
        }
    },[]);
    
    // will probably use redux
    useEffect(() => {
        async function signalRConnect(){
            //todo store the connection and more configuration
            const connection = new signalR.HubConnectionBuilder().withUrl(`functionAppPath/api`).build();
            const cribConnection = clientFactory.crib(connection, {
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
        async function getUserInfo() { 
            try { 
                // need the full path - should import config from another ts file that do not upload to 
                // public github - add environment variables and have parcel do the rest
                const response = await fetch('/.auth/me'); 
                const payload = await response.json(); 
                const { clientPrincipal } = payload; 
                if(clientPrincipal){ 
                  //setUser(clientPrincipal); 
                  //setIsAuthenticated(true); 
                  console.log(`clientPrincipal = ${JSON.stringify(clientPrincipal)}`); 
                }  
            } catch (error:any) { 
                console.error('No profile could be found ' + error?.message?.toString()); 
            } 
        
        };
        signalRConnect();
        //getUserInfo();
    });

    //const canSignalRConnect = isAuthenticated && !connected;

    return <div>

        {/* <button disabled={!canSignalRConnect} onClick={signalRConnectClickHandler}>SignalR connect</button> */}
        <button onClick={sendMessageClickHandler} disabled={!connected}>Send hello to SignalR service</button>
        <div>{receivedBroadcast}</div>
    </div>;
}