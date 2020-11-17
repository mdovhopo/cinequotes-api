import { Response } from "express";

const handlePing = (_, res: Response) => res.send({
	pong: `current server time is ${(new Date().toISOString())}`
});

export default handlePing;
