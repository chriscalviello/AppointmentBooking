import React, { useState, useMemo } from "react";
import { useHistory } from "react-router-dom";
import API from "../../api";

type Context = {
  currentUser?: CurrentUser;
  error: string;
  loading: boolean;
  login: React.Dispatch<LoginUser>;
  logout: React.DispatchWithoutAction;
  setCurrentUser: (user: CurrentUser) => void;
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
  signup: React.Dispatch<SignupUser>;
};

interface Props {
  children: React.ReactNode;
}

export const AuthenticationProvider = ({ children }: Props) => {
  const localStorageCurrentUser = localStorage.getItem("currentUser");
  const [currentUser, setCurrentUser] = useState<CurrentUser | undefined>(
    localStorageCurrentUser !== null && JSON.parse(localStorageCurrentUser)
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const login = async (loginUser: LoginUser) => {
    setLoading(true);
    setError("");

    API.post("/auth/login", { ...loginUser })
      .then((res) => {
        const responseData = res.data;

        const user: CurrentUser = {
          id: responseData.user.id,
          token: responseData.user.accessToken,
          refreshToken: responseData.user.refreshToken,
        };
        setCurrentUser(user);
        localStorage.setItem("currentUser", JSON.stringify(user));
        history.replace("/users");
      })
      .catch((err) => {
        setError(err.response.data.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(undefined);
    history.push("/login");
  };

  const signup = async (newUser: SignupUser) => {
    setLoading(true);
    setError("");

    API.post(
      "/auth/signup",
      { ...newUser },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => {
        const responseData = res.data;

        const user: CurrentUser = {
          id: responseData.user.id,
          token: responseData.user.accessToken,
          refreshToken: responseData.user.refreshToken,
        };
        setCurrentUser(user);
        localStorage.setItem("currentUser", JSON.stringify(user));
        history.replace("/comments");
      })
      .catch((err) => {
        setError(err.response.data.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const context: Context = useMemo<Context>(
    () => ({
      currentUser,
      error,
      loading,
      setCurrentUser,
      setLoading,
      setError,
      login,
      logout,
      signup,
    }),
    [
      currentUser,
      error,
      loading,
      setCurrentUser,
      setLoading,
      setError,
      login,
      logout,
      signup,
    ]
  );

  const createAxiosResponseInterceptor = () => {
    const interceptor = API.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        const refreshToken = currentUser && currentUser.refreshToken;

        if (
          !refreshToken ||
          (error.response && error.response.status !== 401)
        ) {
          return Promise.reject(error);
        }

        API.interceptors.response.eject(interceptor);

        return API.post("auth/token", {
          token: refreshToken,
        })
          .then((response) => {
            const newCurrentUser = { ...currentUser };
            newCurrentUser.token = response.data.user.accessToken;
            localStorage.setItem("currentUser", JSON.stringify(newCurrentUser));
            error.response.config.headers["Authorization"] =
              "Bearer " + newCurrentUser.token;
            return API(error.response.config);
          })
          .catch(() => {
            localStorage.removeItem("currentUser");
            setCurrentUser(undefined);
            history.push("/login");
          })
          .finally(createAxiosResponseInterceptor);
      }
    );
  };

  createAxiosResponseInterceptor();

  return <Context.Provider value={context}>{children}</Context.Provider>;
};

const Context = React.createContext<Context | null>(null);

export const useAuthentication = (): Context => {
  const context = React.useContext(Context);
  if (!context) {
    throw new Error(
      "useAuthentication must be used under a <AuthenticationProvider>"
    );
  }
  return context;
};

type CurrentUser = {
  id: string;
  token: string;
  refreshToken: string;
};

export interface LoginUser {
  email: string;
  password: string;
}

export interface SignupUser {
  name: string;
  email: string;
  password: string;
}
