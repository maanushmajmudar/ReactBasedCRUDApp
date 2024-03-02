import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { readFile } from 'node:fs/promises';
import { GraphQLScalarType } from 'graphql';
import { connectToDb, getuser } from './user.js';

let user;

const app = express();
app.use(express.json());

const GraphQlDateResolver = new GraphQLScalarType({

  name: 'GraphQlDate',
  description: 'A GraphQl Date Type',

  serialize(value) {
    return value.toISOString();
  },

  parseValue(value) {

    const newDate = new Date(value);
    return isNaN(newDate) ? undefined : newDate;

  },
});

const typeDefs = await readFile('./schema.graphql', 'utf8');

const listofEmp = async (parent, args) => {
  if (args.empType != "all") {

    return await user.collection('employees').find({ "empType": args.empType }).toArray();
  }
  const employee = user.collection('employees').find({}).toArray();
  return employee

}

const empDetalis = async (parent, args) => {
  const empDetali = await user.collection('employees').findOne({ id: args.id });
  if (!empDetali) {
    return null;
  }
  const dateOfJoining = new Date(empDetali.dateOfJoining);
  const today = new Date();
  const ageAtJoining = today.getFullYear() - dateOfJoining.getFullYear();
  console.log(ageAtJoining);

  const retirementDate = new Date(dateOfJoining);
  retirementDate.setFullYear(retirementDate.getFullYear() + (65 - empDetali.age));
  const timeLeft = retirementDate - today;
  const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const monthsLeft = Math.floor(daysLeft / 30);
  const yearsLeft = Math.floor(monthsLeft / 12);

  empDetali.ageAtJoining = ageAtJoining;
  empDetali.retirementDate = retirementDate.toDateString();
  empDetali.timeLeftUntilRetirement = {
    days: daysLeft,
    months: monthsLeft,
    years: yearsLeft,
  };
  return empDetali;
}



const getNextId = async () => {
  const count = await user.collection('employees').find({}).count();

  return count + 1;
}


const createEmp = async (_root, { input }) => {
  const employee = {
    ...input,
    id: await getNextId(),
  };

  const output = await user.collection('employees').insertOne(employee);

  const storedEmp = await user.collection('employees').findOne({ _id: output.insertedId });

  return storedEmp;
}

const editEmp = async (parent, args) => {

  const result = await user.collection('employees').updateOne(
    { id: args.id },
    {
      $set: {
        title: args.title,
        dept: args.department,
        currentStatus: args.currentStatus
      }
    }
  )
  return result
}
const removeEmp = async (parent, args) => {

  const employeeData = await user.collection('employees').findOne({ id: args.id });


  console.log(employeeData.currentStatus);

  if (employeeData.currentStatus) {
    return "CAN’T DELETE EMPLOYEE-STATUS ACTIVE";
  }

  const result = await user.collection('employees').findOneAndDelete({ id: args.id });


  return "Employee delete successfully";

}


const resolvers = {

  Query: {
    listofEmp: listofEmp,
    empDetalis: empDetalis
  },

  Mutation: {
    createEmp: createEmp,
    editEmp: editEmp,
    removeEmp: removeEmp
  },

  GraphQlDate: GraphQlDateResolver

}

const apollo = new ApolloServer({
  typeDefs,
  resolvers,
});

await apollo.start();
app.use('/graphql', expressMiddleware(apollo));

connectToDb((url, err) => {
  if (!err) {
    app.listen(4001, () => {
      console.log('Server started on port 4001');
      console.log('GraphQl Server started on http://localhost:4001/graphql');
      console.log('Connected to MongoDB at ', url);
    });
    user = getuser();
  }
});