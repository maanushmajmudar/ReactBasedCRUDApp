import { MongoClient } from 'mongodb';

const url = "mongodb+srv://maanush98:Maanush%401998@assignments.bxmywff.mongodb.net/ems?retryWrites=true&w=majority"
let employee;

const connectToDb = (callback) => {
    MongoClient.connect(url)
        .then(client => {
            employee = client.db();
            return callback(url);
        }).catch(err => {
            console.log(err);
            return callback(url, err);
        })
};

const getuser = () => {
    return employee;
}

export {
    connectToDb,
    getuser,
};