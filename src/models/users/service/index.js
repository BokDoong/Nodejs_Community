import database from "../../../database";

export class UserService {

  //checkUserByEmail
  async checkUserByEmail(email) {
    const user = await database.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) return false;

    return user;
  }

  //findById
  async findByUserId(id) {
    const user = await database.user.findUnique({
      where: {
        id,
      },
    });

    if(!user) {
      throw { status: 404, message: "유저를 찾을 수 없습니다."}
    };

    return user;
  }
  
  //findMany
  async findUsers({ skip, take}) {
  
    const users = await database.user.findMany({
      skip,
      take,
    });

    const count = await database.user.count();

    return {
      users,
      count,
    };
  }

  //create
  async createUser(props) {
    const newUser = await database.user.create({
      data: {
        name: props.name,
        email: props.email,
        phoneNumber: props.phoneNumber,
        password: props.password,
        description: props.description,
      },
    });

    return newUser.id;
  }

  //update
  async updateUser(id, props) {
    //prisma error handling
    const isExist = await database.user.findUnique({
      where: {
        id,
      },
    });

    if (!isExist) {
      throw { status: 404, message: "유저를 찾을 수 없습니다."}
    };
    //비밀번호를 수정할거면 수정
    if (props.password) {
      await props.updatePassword();
    }

    await database.user.update({
      where : {
        id: isExist.id,
      },
      data: {
        name: props.name,
        email: props.email,
        phoneNumber: props.phoneNumber,
        password: props.password,
        description: props.description,
      },
    });
  }

  //delete
  async deleteUser(id) {

    //prisma error handling
    const isExist = await database.user.findUnique({
      where: {
        id,
      },
    });

    if (!isExist){
       throw { status: 404, message: "유저를 찾을 수 없습니다."} 
      };

    await database.user.delete({
      where: {
        id: isExist.id,
      },
    });
  }
}