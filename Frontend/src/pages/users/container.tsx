import React, { useEffect, useState } from "react";
import { useAuthentication } from "../../providers/authentication";
import Home, { UserProps } from ".";
import API from "../../api";

const UsersContainer: React.FC = ({}) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuthentication();
  const [users, setUsers] = useState<UserProps[]>([]);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    API.get("/users/getAll", {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + currentUser?.token,
      },
    })
      .then((res) => {
        const responseData = res.data;
        setUsers(
          responseData.users.map((u: any) => {
            const user: UserProps = {
              id: u._id,
              name: u.name,
              email: u.email,
              role: u.role,
            };
            return user;
          })
        );
      })
      .catch((err) => {
        setError(err.response.data.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id: string) => {
    setLoading(true);
    setError("");

    API.post(
      "/users/delete",
      { id },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + currentUser?.token,
        },
      }
    )
      .then(() => {
        fetchUsers();
      })
      .catch((err) => {
        setError(err.response.data.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Home
      users={users}
      error={error}
      loading={loading}
      onDeleteRequest={deleteUser}
    />
  );
};

export default UsersContainer;
