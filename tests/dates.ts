import * as users from "./database/wrappers/accounts/users";
import * as connection from "../src/database/connection";
import { UserReads } from "./database/wrappers/accounts/users/wrapper";

describe("Test dates in the database", () => {
    it("connects to the database", async () => {
        expect(await connection.connect()).toBeTruthy();
    });

    it("should return a date", async () => {
        const user = await UserReads.getUserById(1);

        expect(user).toBeTruthy();

        if (user) {
            expect(typeof user.created_at).toBe("object");
        }
    });

    it("disconnects from the database", async () => {
        expect(await connection.disconnect()).toBeTruthy();
    });
});
