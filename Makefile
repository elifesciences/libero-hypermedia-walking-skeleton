.DEFAULT_GOAL = run

run:
	make -j 2 run-back-end run-front-end

run-back-end:
	cd back-end && npm install
	cd back-end && npm run start:watch

run-front-end:
	cd front-end && npm install
	cd front-end && npm run start:watch
