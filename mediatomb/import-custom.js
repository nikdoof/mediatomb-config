/*jslint indent: 4, maxerr: 50, sloppy: true */

function addAudio(obj) {
    var desc = '', track = '', temp = '', artist_full, album_full,
		title = obj.meta[M_TITLE], artist = obj.meta[M_ARTIST],
		album = obj.meta[M_ALBUM], date = obj.meta[M_DATE],
		genre = obj.meta[M_GENRE], description = obj.meta[M_DESCRIPTION];

    // first gather data
    if (!title) {
		title = obj.title;
	}

    if (!artist) {
        artist = 'Unknown';
        artist_full = null;
    } else {
        artist_full = artist;
        desc = artist;
    }

    if (!album) {
        album = 'Unknown';
        album_full = null;
    } else {
        desc = desc + ', ' + album;
        album_full = album;
    }

    if (desc) {
        desc = desc + ', ';
	}
    desc = desc + title;

    if (!date) {
        date = 'Unknown';
    } else {
        date = getYear(date);
        desc = desc + ', ' + date;
    }

    if (!genre) {
        genre = 'Unknown';
    } else {
        desc = desc + ', ' + genre;
    }

    if (!description) {
        obj.meta[M_DESCRIPTION] = desc;
    }

    obj.title = title;
    addCdsObject(obj, createContainerChain(['Audio', 'All Audio']));
    addCdsObject(obj, createContainerChain(['Audio', 'Artists', artist, 'All Songs']));

    if (artist_full) {
        temp = artist_full;
	}

	if (album_full) {
		temp = temp + ' - ' + album_full + ' - ';
	} else {
		temp = temp + ' - ';
	}

    obj.title = temp + title;
    addCdsObject(obj, createContainerChain(['Audio', 'All - full name']));
    addCdsObject(obj, createContainerChain(['Audio', 'Artists', artist, 'All - full name']));

    obj.title = track + title;
    addCdsObject(obj, createContainerChain(['Audio', 'Artists', artist, album]), UPNP_CLASS_CONTAINER_MUSIC_ALBUM);
    addCdsObject(obj, createContainerChain(['Audio', 'Albums', album]), UPNP_CLASS_CONTAINER_MUSIC_ALBUM);
    addCdsObject(obj, createContainerChain(['Audio', 'Genres', genre]), UPNP_CLASS_CONTAINER_MUSIC_GENRE);
    addCdsObject(obj, createContainerChain(['Audio', 'Year', date]));
}

function getEp(obj) {
	var ep = '';
	
	// Flexget Renamer Format
	var regex = /(.*) - S(\d\d)E(\d\d) - (.*)/, ep = '';
	var match = regex.exec(obj.title);
    if (match) {
        return 'Episode ' + match[3] + ' - ' + match[4];
	}
	
	// Neighbours Format
	var regex = /(.*) - Episode (\d\d\d\d) - (.*)/, ep = '';
	var match = regex.exec(obj.title);
    if (match) {
        return 'Episode ' + match[2] + ' - ' + match[3];
	}
    return ep;
}

function addVideo(obj) {
    var chain = [], location = obj.location.split('/'), epname = '';

	var root = location[3], series = location[4];
	if (location.length > 5) {
		var season = location[5];
	} else
		var season = null;
		
	// Check if the file is a TV Show
    if (root === "TV") {
        chain.push("TV Shows"); //genre name  (Series, Movies)
        chain.push(series); //series name  (MySeries)
		if (series != 'Neighbours') {
			print('Found TV: ' + series + " - " + season);
			chain.push(season); //season (Series 1, 2, ...)
		} else {
			print('Found TV: ' + location[location.length-3]);
		}

		// Parse the 	title into a useful name
		epname = getEp(obj);
		if (epname) {
			obj.title = epname;
		}

    } else if (root === "Recent") {
        chain.push("Recent");

    } else if (root === "Movies") {
		print("Found Movie: " + obj.title);
		chain.push("Movies");
    } else {
		chain.push("Other");
    }
    addCdsObject(obj, createContainerChain(chain));
}

// main script part
if (getPlaylistType(orig.mimetype) === '') {
    var arr = orig.mimetype.split('/');
    var mime = arr[0];

    print("Importing: " + orig.title + " - MIME: " + mime);

    var obj = orig;
    obj.refID = orig.id;

    if (mime === 'audio') {
        addAudio(obj);
    }

    if (mime === 'video') {
        addVideo(obj);
    }

    if (orig.mimetype === 'application/ogg') {
		if (orig.theora === 1) {
            addVideo(obj);
		} else {
            addAudio(obj);
		}
    }
}
