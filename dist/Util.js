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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9VdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkJBQTRDO0FBRTVDLE1BQXFCLElBQUk7SUFDZCxNQUFNLENBQUMsR0FBRyxDQUFJLEVBQVc7UUFDNUIsSUFBSTtZQUNBLE9BQU8sRUFBRSxFQUFFLENBQUM7U0FDZjtRQUFDLE1BQU07WUFDSixPQUFPLFNBQVMsQ0FBQztTQUNwQjtJQUNMLENBQUM7SUFFTSxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBSSxFQUFvQjtRQUNsRCxJQUFJO1lBQ0EsT0FBTyxNQUFNLEVBQUUsRUFBRSxDQUFDO1NBQ3JCO1FBQUMsTUFBTTtZQUNKLE9BQU8sU0FBUyxDQUFDO1NBQ3BCO0lBQ0wsQ0FBQztJQUVNLE1BQU0sQ0FBQyxlQUFlLENBQUksR0FBTTtRQUNuQyxPQUFPLElBQUEsZ0JBQVcsRUFBQyxJQUFBLGNBQVMsRUFBQyxHQUFHLENBQUMsQ0FBTSxDQUFDO0lBQzVDLENBQUM7SUFFTSxNQUFNLENBQUMsWUFBWSxDQUFJLEdBQU0sRUFBRSxJQUFPO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLEVBQUUsR0FBRyxHQUFHLEVBQUUsR0FBRyxJQUFJLEVBQUUsQ0FBQztRQUNuQyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pDLEtBQUssTUFBTSxTQUFTLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN6QyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUM7Z0JBQUUsT0FBUSxNQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDdkU7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0NBQ0o7QUE3QkQsdUJBNkJDIn0=