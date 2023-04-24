export function parseVec3(txt) {
    try {
        var v = JSON.parse(txt);
        if (v.length == 3) {
            return v;
        }
    } catch (e) {
      console.log(e);
    }
    return [0, 0, 0];
}
export function parseVec2(txt) {
    try {
        var v = JSON.parse(txt);
        if (v.length == 2) {
            return v;
        }
    } catch (e) {
      console.log(e);
    }
    return [0, 0];
}
export function parseNum(txt) {
    try {
        var v = JSON.parse(txt);
        return Number(v);
    } catch (e) {
        console.log(e);
    }
    return 0;
}