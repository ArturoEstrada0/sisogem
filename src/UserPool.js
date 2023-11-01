import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
    UserPoolId: "us-east-1_pBhWMoyhk",
    ClientId: "6404v0k8319ccmqe2r1a0eg00a",
    ExplicitAuthFlows: ["ALLOW_USER_SRP_AUTH"]
}

export default new CognitoUserPool(poolData);
