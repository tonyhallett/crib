import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { Auth0ContextInterface, User } from "@auth0/auth0-react";
import * as signalR from "@microsoft/signalr";
import { CribClient } from "../src/generatedTypes";
import { restoreActWarning, suppressActWarning } from "../test-helpers/helpers";

type PublicInterface<T> = Pick<T, keyof T>;
const mockConnectionStart = jest.fn();
let mockSignalRConnection:
  | jest.Mocked<
      Pick<
        PublicInterface<signalR.HubConnection>,
        "on" | "send" | "start" | "onclose"
      >
    >
  | undefined;

const withUrlSpy = jest.spyOn(
  signalR.HubConnectionBuilder.prototype,
  "withUrl"
);
const mockConnectionOn = jest.fn();
let sendListeners: Map<string, (...args: any[]) => void> = new Map();

jest
  .spyOn(signalR.HubConnectionBuilder.prototype, "build")
  .mockImplementation(() => {
    const send: signalR.HubConnection["send"] = jest
      .fn()
      .mockImplementation((methodName: string, ...args: any[]) => {
        setTimeout(() => {
          sendListeners.get(methodName)?.(...args);
        }, 0);
      });

    mockSignalRConnection = {
      on: mockConnectionOn,
      send: send as any,
      start: mockConnectionStart,
      onclose: jest.fn(),
    };
    return mockSignalRConnection as unknown as signalR.HubConnection;
  });

let mockAuth0: Partial<Auth0ContextInterface<User>> | undefined;
jest.mock("@auth0/auth0-react", () => {
  return {
    useAuth0: function () {
      return mockAuth0;
    },
  };
});

describe("<App/>", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sendListeners.clear();
  });

  it("should render error if auth error", () => {
    mockAuth0 = {
      error: new Error("Error !"),
      isAuthenticated: false,
    };
    const { getByText } = render(<App />);
    getByText("Error !"); // todo
  });

  it("should render is loading if auth is loading", () => {
    mockAuth0 = {
      isLoading: true,
      isAuthenticated: false,
    };
    const { getByText } = render(<App />);
    getByText("Loading"); // todo
  });

  describe("when authenticated", () => {
    afterEach(() => {
      mockAuth0 = {
        isAuthenticated: true,
        user: {
          email: "email@email.com",
        },
      };
      restoreActWarning();
    });

    it("should render a logout button with user email if authenticated", async () => {
      mockAuth0 = {
        isAuthenticated: true,
        user: {
          email: "email@email.com",
        },
      };
      const { findByRole } = render(<App />);

      // getByRole works - this prevents act warning
      await findByRole("button", { name: "Log out email@email.com" });
    });

    it("should create a signalR connection with the auth0 id token", async () => {
      suppressActWarning();

      mockAuth0 = {
        isAuthenticated: true,
        user: {
          email: "email@email.com",
        },
        getIdTokenClaims() {
          const mockIdToken = {
            __raw: "idToken",
          };
          return Promise.resolve(mockIdToken);
        },
      };

      render(<App />);

      const connectionOptions = withUrlSpy.mock.calls[0][1];
      const accessToken = await connectionOptions.accessTokenFactory!();

      expect(accessToken).toBe("idToken");
    });

    it("should start a connection to signalR", () => {
      render(<App />);

      waitFor(() => expect(mockConnectionStart).toHaveBeenCalled());
    });

    it("should request InitialPlayerData when connected to signalR", async () => {
      render(<App />);

      await waitFor(() =>
        expect(mockSignalRConnection!.send).toHaveBeenCalledWith(
          "InitialPlayerData"
        )
      );
    });

    it("should render a fetching indicator when has not fetched initial player data", async () => {
      const { findByText } = render(<App />);

      await findByText("Fetching");
    });

    const respondToInitialPlayerDataRequest = (
      ...args: Parameters<CribClient["initialPlayerData"]>
    ) => {
      sendListeners.set("InitialPlayerData", () => {
        var initialPlayerDataHandler: CribClient["initialPlayerData"] =
          mockConnectionOn.mock.calls.find((args) => {
            return args[0] === "initialPlayerData";
          })![1];
        // will not accept null
        initialPlayerDataHandler(args[0], args[1]);
      });
    };

    // describe what happens when click submit that sends to the server and when server responds all is good

    xit("should render server friends when click Friends menu", async () => {});
  });

  describe("when not authenticated", () => {
    it("should render a login button if not authenticated", () => {
      mockAuth0 = {
        isAuthenticated: false,
      };
      const { getByRole } = render(<App />);
      getByRole("button", { name: "Log in" }); // todo
    });

    it("should auth0 loginWithRedirect when login button is clicked", () => {
      const mockLoginWithRedirect = jest.fn();
      mockAuth0 = {
        isAuthenticated: false,
        loginWithRedirect: mockLoginWithRedirect,
      };
      const { getByRole } = render(<App />);
      const button = getByRole("button", { name: "Log in" });
      (button as HTMLButtonElement).click();

      expect(mockLoginWithRedirect).toHaveBeenCalled();
    });
  });
});
