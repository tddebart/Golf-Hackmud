export default (context: Context, args?: any): any => {
    const lib = $fs.scripts.lib();

    if (lib.caller_is_owner(context)) {
        if (args?.f != undefined) {
            return $db.f(args.f).array();
        }
        if (args?.count != undefined) {
            return $db.f(args.count).count();
        }
        if (args?.session_count != undefined) {
            return $db.f({type: args.session_count + "_session"}).count();
        }
    }

    return "Only the owner can do this";
}