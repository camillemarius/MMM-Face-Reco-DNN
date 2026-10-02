# Which pictures extendDataset keeps. Run: python -m unittest discover -s test -p "test_*.py"
import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "tools"))
from utils.helper import Helper


class KeepsPictureTest(unittest.TestCase):
    def test_no_names_given_keeps_everyone(self):
        for name in ("anna", "unknown"):
            self.assertTrue(Helper.keepsPicture(name, ""))
            self.assertTrue(Helper.keepsPicture(name, None))

    def test_only_unknown(self):
        self.assertTrue(Helper.keepsPicture("unknown", "unknown"))
        self.assertFalse(Helper.keepsPicture("anna", "unknown"))

    def test_several_names(self):
        self.assertTrue(Helper.keepsPicture("ben", "unknown,ben"))
        self.assertFalse(Helper.keepsPicture("anna", "unknown, ben"))
        self.assertTrue(Helper.keepsPicture("ben", "unknown, ben"))


if __name__ == "__main__":
    unittest.main()
