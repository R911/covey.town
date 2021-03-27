import { nanoid } from "nanoid";

export default class Message {
    public body: string;

    public receivers: [];

    private readonly _id: string;

    constructor(body: string, receivers: []) {
        this._id = nanoid();
        this.body = body;
        this.receivers = receivers;
    }
}