import { nanoid } from "nanoid";

export default class Message {
    public messageBody: string;

    public receivers: string;

    private readonly _id: string;

    constructor(body: string, receivers: string) {
        this._id = nanoid();
        this.messageBody = body;
        this.receivers = receivers;
    }

    get bodyOfMessage(): string {
        return this.messageBody;
    }

    get receiverOfMessage(): string {
        return this.receivers;
    }
}