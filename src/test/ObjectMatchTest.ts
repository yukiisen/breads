import assert from "assert";
import { checkObject, BV } from "../middlewares/validateBody";
import { info, success } from "./helpers/testlog";

/**
 * Basic Test
 */
export function test1 () {
    
    const human = {
        name: "yuki",
        age: 17,
        country: "algeria"
    }

    const humanShema: bodyStructure = {
        name: BV.string,
        age: BV.number,
        country: BV.string
    }

    info("Testing for Object", human);
    info("With Shema        ", humanShema);

    assert.ok(checkObject(human, humanShema), "Test failed, the shema should match the object");
    success("Test1 Succesful!");
}

/**
 * Deep checking test
 */
export function test2 () {
    const human = {
        name: "yuki",
        age: 17,
        country: "algeria",
        studies: {
            speciality: "Maths",
            degree: "High School"
        }
    }

    const humanShema: bodyStructure = {
        name: BV.string,
        age: BV.number,
        country: BV.string,
        studies: {
            speciality: BV.string,
            degree: BV.string
        }
    }

    info("Testing for Object", human);
    info("With Shema        ", humanShema);

    assert.ok(checkObject(human, humanShema), "Test failed, the shema should match the object");
    success("Test2 Succesful!");
}

/**
 * Making sure it returns false when there's a deep unmatch
 */
export function test3 () {
    const human = {
        name: "yuki",
        age: 17,
        country: "algeria",
        studies: {
            speciality: "Maths",
            degree: "High School"
        }, 
        family: {
            father: true,
        }
    }

    const humanShema: bodyStructure = {
        name: BV.string,
        age: BV.number,
        country: BV.string,
        family: {
            father: BV.boolean,
            mother: BV.boolean
        },
        studies: {
            speciality: BV.string,
            degree: BV.string
        }
    }

    info("Testing for Object", human);
    info("With Shema        ", humanShema);

    assert.ok(!checkObject(human, humanShema), "Test failed, the shema should not match the object");
    success("Test3 Succesful!");
}

/**
 * Makes sure that extra properties don't affect the test.
 */
export function test4 () {
    const human = {
        name: "yuki",
        age: 17,
        country: "algeria",
        studies: {
            speciality: "Maths",
            degree: "High School"
        }, 
        family: {
            father: true,
            mother: true
        }
    }

    const humanShema: bodyStructure = {
        name: BV.string,
        age: BV.number,
        country: BV.string,
        family: {
            mother: BV.boolean
        },
        studies: {
            speciality: BV.string,
            degree: BV.string
        }
    }

    info("Testing for Object", human);
    info("With Shema        ", humanShema);

    assert.ok(checkObject(human, humanShema), "Test failed, the shema should match the object");
    success("Test4 Succesful!");
}