import { Autoincrement, Entity, Primary, Repository } from "framework";

@Entity("user")
class User {
  @Primary()
  @Autoincrement()
  id: number;

  name: string;

  age: number;

  beforeInsert(user: User) {
    console.log("Before insert user with ID: ", user.id);
    return user;
  }
}

const usersRepository = new Repository(User);

const main = async () => {
  const insertionResult = await usersRepository.insert({ name: "Sam Johnson", age: 32 });
  const sams = await usersRepository.getMany({
    where: {
      name: { contains: "J" },
      age: { lessThan: 50 },
    },
  });
  const removingResult = await usersRepository.remove({ where: { name: { startsWith: "Sam" } } });
  console.log({ insertionResult, sams, removingResult });
};

main();
