all: dependencies quality static serve

clean:
	rm -rf public/css
	rm -rf public/js
	rm -rf public/fonts

dependencies:
	npm install

update_po:
	node_modules/.bin/extract-pot --locale locale .
	node_modules/i18n-abide/bin/merge-po.sh locale

compile_json:
	node_modules/i18n-abide/bin/compile-json locale locale

quality:
	gulp lint

js:
	mkdir -p public/js
	cp -f node_modules/requirejs/require.js public/js
	node_modules/.bin/r.js -o build.js

css:
	mkdir -p public/css
	cp -rf static/fonts public/fonts
	gulp styles

static: clean js css

serve:
	node app/server.js
