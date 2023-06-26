/* eslint-disable */
import { IdToken, useAuth0 } from "@auth0/auth0-react";
import { useState, useCallback } from "react";

const Claims = (props: { idToken: IdToken | undefined }) => {
  const idToken = props.idToken;
  if (idToken) {
    return (
      <table>
        <thead>
          <tr>
            <th>Claim</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>aud</td>
            <td>{idToken.aud}</td>
          </tr>
          <tr>
            <td>acr</td>
            <td>{idToken.acr}</td>
          </tr>
          <tr>
            <td>amr</td>
            <td>{idToken.amr}</td>
          </tr>
          <tr>
            <td>azp</td>
            <td>{idToken.azp}</td>
          </tr>
          <tr>
            <td>cnf</td>
            <td>{idToken.cnf}</td>
          </tr>
          <tr>
            <td>exp</td>
            <td>{idToken.exp}</td>
          </tr>
          <tr>
            <td>iat</td>
            <td>{idToken.iat}</td>
          </tr>
          <tr>
            <td>iss</td>
            <td>{idToken.iss}</td>
          </tr>
          <tr>
            <td>jti</td>
            <td>{idToken.jti}</td>
          </tr>
          <tr>
            <td>nbf</td>
            <td>{idToken.nbf}</td>
          </tr>
        </tbody>
      </table>
    );
  }
  return null;
};

const UserClaims = () => {
  const { user } = useAuth0();
  return (
    <div>
      <div>Id token user claims</div>
      <ObjectEntries object={user!} />
    </div>
  );
};

// todo change to show object entries !
const ObjectEntries = (props: { object: {} }) => {
  const keyValues = Object.entries(props.object).map((entry) => {
    return (
      <div key={entry[0]}>
        <div>{entry[0] as any}</div>
        <div>{entry[1] as any}</div>
      </div>
    );
  });
  return <div>{keyValues}</div>;
};

const fetchProfile = async (accessToken: string) => {
  const url = `https://dev-jzu1ks76wi2i513m.uk.auth0.com/userinfo`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    var st = "";
  }
  return response.json();
};

const managementAPi = async (idToken: string, userId: string) => {
  const url = `https://dev-jzu1ks76wi2i513m.uk.auth0.com/api/v2/users/${userId}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
  });

  const responseJson = await response.json();
  console.log(JSON.stringify(responseJson));
  return responseJson;
};

const TestManagementApi = ({}) => {
  const { getAccessTokenSilently, user } = useAuth0();
  const [managementUser, setManagementUser] = useState();
  const clickCallback = useCallback(async () => {
    const sub = user!.sub; // 			auth0|6411ea174c484ade93a9b0a7
    const accessToken = await getAccessTokenSilently();
    const res = await managementAPi(accessToken, sub!);
    setManagementUser(res);
  }, []);
  return (
    <div>
      <button onClick={clickCallback}>Test management api</button>
      {/* {managementUser && <ObjectEntries object={managementUser}/>} */}
    </div>
  );
};
