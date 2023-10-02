import { useState } from "react";
import { ActionFunction,useRouteLoaderData,Outlet, LoaderFunction, RouterProvider, createBrowserRouter, useLoaderData, useFetcher, NavLink } from "react-router-dom";

interface ColourSettings{
    someSetting:string;
}
const colourSettings:ColourSettings = {
    someSetting:"blue"
}

const rootLoader:LoaderFunction = ({request}) => {
    console.log("root loader");
    return colourSettings;
}

const someSettingInputName = "someSetting";

const rootAction:ActionFunction = async ({request,}) => {
    const formData = await request.formData();
    const someSetting = formData.get(someSettingInputName);
    colourSettings.someSetting = someSetting as string;
    return null;
}

function Root(){
    const colourSettings = useLoaderData() as ColourSettings;
    const fetcher = useFetcher();
    
    return (
    <div>
        <fetcher.Form method="post">
            <input
            type="text"
            name={someSettingInputName}
            defaultValue={colourSettings.someSetting}
            />
            <button type="submit">Change settings</button>
        </fetcher.Form>
        <div>The outlet below</div>
        <NavLink to='/'  style={({ isActive }) => {
		    return {
                display:"block",
		      color: isActive ? "green" : "inherit",
		    };
		  }}
        >Home</NavLink>
        <NavLink to='/child'  style={({ isActive }) => {
		    return {
                display:"block",
		      color: isActive ? "green" : "inherit",
		    };
		  }}
        >Child</NavLink>
        <Outlet/>
    </div>)
}

function Child(){
    const [someState, setSomeState] = useState("initial")
    //const childLoaderData = useLoaderData(); // is undefined as have not provided own
    const colourSettings = useRouteLoaderData("root") as ColourSettings;
    return <>
        <button onClick={() => setSomeState("changed")}>Change state</button>
        <div>{`state - ${someState}`}</div>
        <div>{`Child ${colourSettings.someSetting}`}</div>
    </>
}

const router = createBrowserRouter([
    {
      path: "/",
      element: <Root/>,
      id:'root',
      loader: rootLoader,
      action: rootAction,
      children:[
        {
            path:"child",
            element:<Child/>
        }
      ]
    },
  ]);


export function DemoReactRouter(){
    return <RouterProvider router={router} />
}

