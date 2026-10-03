# Settings the recognition script reads from its command line. Run: python -m unittest discover -s test -p "test_*.py"
import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "tools"))
from utils.arguments import Arguments


class ExposureValueTest(unittest.TestCase):
    def parse(self, *argv):
        sys.argv = ["recognition.py", *argv]
        Arguments.prepareRecognitionArguments()

    def test_exposure_value(self):
        self.parse("--exposureValue=1")
        self.assertEqual(Arguments.get("exposureValue"), 1.0)
        self.parse("--exposureValue=-0.5")
        self.assertEqual(Arguments.get("exposureValue"), -0.5)

    def test_default_no_correction(self):
        self.parse()
        self.assertEqual(Arguments.get("exposureValue"), 0.0)


if __name__ == "__main__":
    unittest.main()
