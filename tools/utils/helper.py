import argparse


class Helper:
    # To properly pass JSON.stringify()ed bool command line parameters, e.g. "--extendDataset"
    # See: https://stackoverflow.com/questions/15008758/parsing-boolean-values-with-argparse
    def str2bool(v):
        if isinstance(v, bool):
            return v
        if v.lower() in ("yes", "true", "t", "y", "1"):
            return True
        elif v.lower() in ("no", "false", "f", "n", "0"):
            return False
        else:
            raise argparse.ArgumentTypeError("Boolean value expected.")

    # extendDataset keeps a picture of this name? "unknown,ben" = only these names, empty = everyone
    def keepsPicture(name, onlyNames):
        only = [n.strip() for n in (onlyNames or "").split(",") if n.strip()]
        return not only or name in only
