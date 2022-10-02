"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const v8_1 = require("v8");
class Util {
    static try(fn) {
        try {
            return fn();
        }
        catch {
            return undefined;
        }
    }
    static async tryPromise(fn) {
        try {
            return await fn();
        }
        catch {
            return undefined;
        }
    }
    static structuredClone(obj) {
        return (0, v8_1.deserialize)((0, v8_1.serialize)(obj));
    }
    static mergeDefault(def, prov) {
        const merged = { ...def, ...prov };
        const defKeys = Object.keys(def);
        for (const mergedKey of Object.keys(merged)) {
            if (!defKeys.includes(mergedKey))
                delete merged[mergedKey];
        }
        return merged;
    }
}
exports.default = Util;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYzIvVXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJCQUE0QztBQUU1QyxNQUFxQixJQUFJO0lBQ2QsTUFBTSxDQUFDLEdBQUcsQ0FBSSxFQUFXO1FBQzVCLElBQUk7WUFDQSxPQUFPLEVBQUUsRUFBRSxDQUFDO1NBQ2Y7UUFBQyxNQUFNO1lBQ0osT0FBTyxTQUFTLENBQUM7U0FDcEI7SUFDTCxDQUFDO0lBRU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUksRUFBb0I7UUFDbEQsSUFBSTtZQUNBLE9BQU8sTUFBTSxFQUFFLEVBQUUsQ0FBQztTQUNyQjtRQUFDLE1BQU07WUFDSixPQUFPLFNBQVMsQ0FBQztTQUNwQjtJQUNMLENBQUM7SUFFTSxNQUFNLENBQUMsZUFBZSxDQUFJLEdBQU07UUFDbkMsT0FBTyxJQUFBLGdCQUFXLEVBQUMsSUFBQSxjQUFTLEVBQUMsR0FBRyxDQUFDLENBQU0sQ0FBQztJQUM1QyxDQUFDO0lBRU0sTUFBTSxDQUFDLFlBQVksQ0FBSSxHQUFNLEVBQUUsSUFBTztRQUN6QyxNQUFNLE1BQU0sR0FBRyxFQUFFLEdBQUcsR0FBRyxFQUFFLEdBQUcsSUFBSSxFQUFFLENBQUM7UUFDbkMsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqQyxLQUFLLE1BQU0sU0FBUyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDekMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDO2dCQUFFLE9BQVEsTUFBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQ3ZFO1FBQ0QsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztDQUNKO0FBN0JELHVCQTZCQyJ9