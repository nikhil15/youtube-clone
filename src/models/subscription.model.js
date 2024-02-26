import mongoose, { Model, Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // one who is subscribing
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, // one to whom 'subscriber' is subscribing
        ref: "User"
    }
}, 
{ 
    timestamps 
}
)

export const Subscription = new mongoose.model('Subscription', subscriptionSchema)