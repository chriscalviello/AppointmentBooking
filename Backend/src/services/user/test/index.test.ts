import { Comment, CommentWithUser } from "../../../models/comment";
import { User } from "../../../models/user";
import { Roles } from "../../../authorization";
import * as dep from "../../database/fake";
import { FakeUserService } from "../fake";

const mocked = dep as jest.Mocked<typeof dep>;
const mockedDatabaseService = mocked.FakeDatabaseService;

const fixUserRelation = (user: User, comments: Comment[]) => {
  return comments.map((c: Comment) => {
    return new CommentWithUser(c, user);
  });
};

let users: User[];

mockedDatabaseService.prototype.getUsers = jest.fn(() => {
  return users;
});

mockedDatabaseService.prototype.getComments = jest.fn(() => {
  const comments = users.map((u: User) => fixUserRelation(u, u.comments));

  return comments.flat();
});

mockedDatabaseService.prototype.updateData = jest.fn((data: User[]) => {
  users = [...data];
});

describe("FakeUserService", () => {
  const sut = new FakeUserService(mockedDatabaseService.prototype);

  beforeEach(() => {
    users = [
      {
        id: "1",
        email: "emailadmin",
        password: "passwordadmin",
        name: "nameadmin",
        surname: "surnameadmin",
        comments: [
          {
            id: "3",
            title: "title3",
            body: "body3",
            created_at: new Date(2020, 1, 1),
          },
          {
            id: "5",
            title: "title5",
            body: "body5",
            created_at: new Date(2021, 1, 1),
          },
        ],
        role: Roles.admin,
      },
      {
        id: "2",
        email: "emailuser",
        password: "passworduser",
        name: "nameuser",
        surname: "surnameuser",
        comments: [
          {
            id: "4",
            title: "title3",
            body: "body3",
            created_at: new Date(),
          },
        ],
        role: Roles.user,
      },
    ];
  });

  it("should getById", () => {
    const user = sut.getById("2");
    expect(user).toBeDefined();
    expect(user && user.email).toBe("emailuser");
  });

  it("should not getById", () => {
    const user = sut.getById("fake");
    expect(user).toBeUndefined();
  });

  it("should throw an erorr when edit with invalid user", () => {
    expect(() => sut.edit("", "", "", "fake", Roles.user)).toThrow();
  });

  it("should update user when edit", () => {
    const updatedUser = sut.edit(
      "newEmail",
      "newName",
      "newSurname",
      "1",
      Roles.user
    );

    expect(updatedUser).toBeDefined();
    expect(updatedUser.email).toBe("newEmail");
    expect(updatedUser.name).toBe("newName");
    expect(updatedUser.surname).toBe("newSurname");
    expect(updatedUser.role).toBe(Roles.user);
    expect(updatedUser.id).toBe("1");

    const storedUser = users.find((c) => c.id === "1");
    expect(storedUser).toBeDefined();
    expect(storedUser && storedUser.email).toBe("newEmail");
    expect(storedUser && storedUser.name).toBe("newName");
    expect(storedUser && storedUser.surname).toBe("newSurname");
    expect(storedUser && storedUser.role).toBe(Roles.user);
    expect(storedUser && storedUser.id).toBe("1");
  });

  it("should add a new user when create", () => {
    const newUser = sut.create(
      "email",
      "password",
      "name",
      "surname",
      Roles.user
    );

    expect(newUser).toBeDefined();
    expect(newUser.email).toBe("email");
    expect(newUser.name).toBe("name");
    expect(newUser.surname).toBe("surname");
    expect(newUser.password).toBe("password");
    expect(newUser.role).toBe(Roles.user);
    expect(newUser.id).toBeDefined();

    const storedUser = users.find((c) => c.id === newUser.id);
    expect(storedUser).toBeDefined();
    expect(storedUser && storedUser.email).toBe("email");
    expect(storedUser && storedUser.name).toBe("name");
    expect(storedUser && storedUser.password).toBe("password");
    expect(storedUser && storedUser.surname).toBe("surname");
    expect(storedUser && storedUser.role).toBe(Roles.user);
    expect(storedUser && storedUser.id).toBe(newUser.id);
  });

  it("should delete", () => {
    sut.delete("1");

    const storedComment = users.find((c) => c.id === "1");
    expect(storedComment).toBeUndefined();
    expect(users.length).toBe(1);
  });

  it("should throw an erorr when edit with invalid user", () => {
    expect(() => sut.delete("fake")).toThrow();
  });
});
