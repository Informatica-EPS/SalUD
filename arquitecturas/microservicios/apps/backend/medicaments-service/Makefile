.PHONY: setup test

setup:
	python3 -m venv .venv
	.venv/bin/pip install -r requirements.txt

test:
	PYTHONPATH=. .venv/bin/python3 -m pytest -v
