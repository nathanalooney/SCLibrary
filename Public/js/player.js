(function() {


var LibraryBox = React.createClass({
  render: function() {
    return (
      <div>
        <SongList songs={this.props.songs}/>
      </div>
    );
  }
});

var SongList = React.createClass({
	getInitialState: function() {
		return ({
			soundcloud_id: songPlayer.soundcloud_id,
			isPaused: songPlayer.isPaused(),
		});
	},
	playSong: function(song) {
		if (this.state.soundcloud_id == song.id) {
			if (!this.state.isPaused) {
				this.setState({isPaused: true}, function() {
					songPlayer.pause();
				});
			} else {
				this.setState({isPaused: false}, function() {
					songPlayer.play();
				})
			}
		} else {
			this.setState({soundcloud_id: song.id, isPaused: false}, function() {
				songPlayer.playNew(song);
			});			
		}
	},
    render: function() {
    	var songNodes = this.props.songs.map(function(song, i) {
	      	return (
	      		<div key={i}>
		          <Song song={song} playSong={this.playSong} soundcloud_id={this.state.soundcloud_id} isPaused={this.state.isPaused} ></Song>
		          <hr/>
	          	</div>
	        );
	    }, this);

		return (
		<div className="songList">
		  {songNodes}
		</div>
		);
    }
});

var Song = React.createClass({
	playSong: function() {
		this.props.playSong(this.props.song);
	},
  registerClick: function(event) {

    function getPosition(el) {
      var xPosition = 0;
      var yPosition = 0;
     
      while (el) {
        if (el.tagName == "BODY") {
          // deal with browser quirks with body/window/document and page scroll
          var xScrollPos = el.scrollLeft || document.documentElement.scrollLeft;
          var yScrollPos = el.scrollTop || document.documentElement.scrollTop;
     
          xPosition += (el.offsetLeft - xScrollPos + el.clientLeft);
          yPosition += (el.offsetTop - yScrollPos + el.clientTop);
        } else {
          xPosition += (el.offsetLeft - el.scrollLeft + el.clientLeft);
          yPosition += (el.offsetTop - el.scrollTop + el.clientTop);
        }
     
        el = el.offsetParent;
      }
      return {
        x: xPosition,
        y: yPosition
      };
    }
    var div = ReactDOM.findDOMNode(this)
    var svg = div.querySelector('svg')
    var posX = getPosition(svg);
    songPlayer.audio.currentTime = Math.floor((((event.clientX - posX.x)/div.offsetWidth)*songPlayer.audio.duration))
    console.log(Math.floor((((event.clientX - posX.x)/div.offsetWidth)*songPlayer.audio.duration)));
  },
	render: function() {
		var glyph = (this.props.soundcloud_id === this.props.song.id && !this.props.isPaused) ? "pause" : "play-circle";
		var glyph_class = "glyphicon glyphicon-"+glyph;
		return (
			<div>
        <span className={glyph_class} onClick={this.playSong}></span>
          <div className={"song-info-container"}> 
  				  <h3> {this.props.song.user.username} </h3>
  				  <p> {this.props.song.title} </p>
          </div>
        <div id={'player_'+this.props.song.id} onClick={this.registerClick}></div>
			</div>
		);
	}
});







//------------------------------------------------------------------------------------------------
var renderLibrary = function(displayList, filterOnly) {
	$('#main').empty();
	var filteredPlaylist = filterLibrary(displayList);
	var sortedPlaylist = sortLibrary(filteredPlaylist);	
	songPlayer.playlist = applyPlaylistIDs(sortedPlaylist);
	ReactDOM.render(
	  <SongList songs={songPlayer.playlist}/>,
	  document.getElementById('main')
	);
}

var applyPlaylistIDs = function(playlist) {
	for (var i = 0; i < playlist.length; i++) {
		playlist[i].playlist_id = i;
	}
	return playlist;
}

var filterLibrary = function(library) {
	var returnLibrary = [];
	library.forEach(function(song) {

		var title = song.title.toLowerCase();
		var user = song.user.username.toLowerCase();
		var term = $('#searchbar').val().toLowerCase();
		if (term.length > 0) {
			if (title.indexOf(term) > -1 || user.toLowerCase().indexOf(term) > -1) {
				var isRemix = false;
				if (title.indexOf("remix") > -1 ||
						title.indexOf("edit") > -1 ||
						title.indexOf("mashup") > -1 || 
						title.indexOf("flip") > -1 || 
						title.indexOf("cover") > -1 ||
						title.indexOf("bootleg") > -1 ||
						title.indexOf('redo') > -1) {
					isRemix = true;
				} 		
				if ($('#remixes').is(':checked') && isRemix == true) returnLibrary.push(song);
				if ($('#originals').is(':checked') && isRemix == false) returnLibrary.push(song);
			}
		} else {
			var isRemix = false;
			if (title.indexOf("remix") > -1 ||
					title.indexOf("edit") > -1 ||
					title.indexOf("mashup") > -1 || 
					title.indexOf("flip") > -1 || 
					title.indexOf("cover") > -1 ||
					title.indexOf("bootleg") > -1 ||
					title.indexOf('redo') > -1) {
				isRemix = true;
			} 		
			if ($('#remixes').is(':checked') && isRemix == true) returnLibrary.push(song);
			if ($('#originals').is(':checked') && isRemix == false) returnLibrary.push(song);			
		}
	});
	return returnLibrary;
}

var sortLibrary = function(library) {
	switch(librarySort) {
		case 0:
			library.sort(sortTitle);
			break;
		case 1:
			library.sort(sortArtist);
			break;
		case 2:
			library.sort(sortDate);
			break;
		case 3:
			library.sort(sortFavorites);
			break;
		case 4:
			library.sort(sortPlays);
			break;
		case 5:
			library = shuffle(library);
			break;
	}
	return library;
}

var sortTitle = function(a, b) {
	if ($('#sort-title').attr('sort') == 'ascending') {
		b = [a, a = b][0];
	} 
	if (a.title.replace(/\W/g, '').toLowerCase() < b.title.replace(/\W/g, '').toLowerCase()) {
		return -1;		
	}
	else if (a.title.replace(/\W/g, '').toLowerCase() > b.title.replace(/\W/g, '').toLowerCase()) {
		return 1;
	} 
	else return 0;
}

var sortArtist = function(a, b) {
	if ($('#sort-artist').attr('sort') == 'ascending') {
		b = [a, a = b][0];
	} 
	if (a.user.username.replace(/\W/g, '').toLowerCase() < b.user.username.replace(/\W/g, '').toLowerCase()) {
		return -1;		
	}
	else if (a.user.username.replace(/\W/g, '').toLowerCase() > b.user.username.replace(/\W/g, '').toLowerCase()) {
		return 1;
	} 
	else return 0;
}

var sortDate = function(a, b) {
		if ($('#sort-date').attr('sort') == 'descending') {
			b = [a, a = b][0];
		} 
		if (a.sclibrary_id < b.sclibrary_id) {
			return -1;		
		}
		else if (a.sclibrary_id > b.sclibrary_id) {
			return 1;
		} 
		else return 0;
	}

var sortFavorites = function(a, b) {
	if ($('#sort-favorites').attr('sort') == 'ascending') {
		b = [a, a = b][0];
	} 
	if (parseInt(a.favoritings_count) < parseInt(b.favoritings_count)) {
		return -1;		
	}
	else if (parseInt(a.favoritings_count) > parseInt(b.favoritings_count)) {
		return 1;
	} 
	else return 0;
}

var sortPlays = function(a, b) {
	if ($('#sort-plays').attr('sort') == 'ascending') {
		b = [a, a = b][0];
	} 
	if (parseInt(a.playback_count) < parseInt(b.playback_count)) {
		return -1;		
	}
	else if (parseInt(a.playback_count) > parseInt(b.playback_count)) {
		return 1;
	} 
	else return 0;
}

var shuffle = function(library) {
	var currentIndex = library.length, temporaryValue, randomIndex;
	while(currentIndex !== 0) {
		randomIndex = Math.floor(Math.random()*currentIndex);
		currentIndex -= 1;

		temporaryValue = library[currentIndex];
		library[currentIndex] = library[randomIndex];
		library[randomIndex] = temporaryValue;
	}
	return library;
}
//----------------------------------------------------------------------------------------------------//


var fullLibrary = [];
var responseList = [];
var searchTimer = null;
var librarySort = null;
var songPlayer = {
	is_dissociated: false,
	dissociated_playlist: null,
	playlist: null,
	audio: null,
	soundcloud_id: null,
	prev_id: null,
	current_id: null,
	next_id: null,
	playNew: function(song) {
		this.associate();
		if (this.audio) this.audio.pause();
		this._setIDs(song.playlist_id);	
		this.soundcloud_id = song.id;
		var full_stream_url = this.playlist[song.playlist_id].stream_url+'?client_id=96089e67110795b69a95705f38952d8f';
		this.audio = new Audio(full_stream_url);
    this.audio.crossOrigin = "anonymous";
		this.audio.addEventListener('ended', this._addNextSongHandler.bind(this));
		this.audio.play();
    visualizer(this, song.id);
	},
	play: function() {
		console.log("Play");
		songPlayer.audio.play();
	},
	pause: function() {
		console.log("Pause");
		songPlayer.audio.pause();
	},
	isPaused: function() {
		if (this.audio) {
			return this.audio.paused;			
		} else {
			return true;
		}
	},
	playNext: function() {
		this.audio.pause();
		console.log(this.is_dissociated)
		this._setIDs(this.next_id);

		if (!this.is_dissociated) {
			this.soundcloud_id = this.playlist[this.current_id].id;
			var full_stream_url = this.playlist[this.current_id].stream_url+'?client_id=96089e67110795b69a95705f38952d8f';
		} else {
			this.soundcloud_id = this.dissociated_playlist[this.current_id].id;
			var full_stream_url = this.dissociated_playlist[this.current_id].stream_url+'?client_id=96089e67110795b69a95705f38952d8f';
		}
		this.audio = new Audio(full_stream_url);
		this.audio.play();
		renderLibrary(fullLibrary);			
	},
	playPrevious: function() {
		this.audio.pause();
		this._setIDs(this.prev_id);
		if (!this.is_dissociated) {
			this.soundcloud_id = this.playlist[this.current_id].id;
			var full_stream_url = this.playlist[this.current_id].stream_url+'?client_id=96089e67110795b69a95705f38952d8f';
		} else {
			this.soundcloud_id = this.dissociated_playlist[this.current_id].id;
			var full_stream_url = this.dissociated_playlist[this.current_id].stream_url+'?client_id=96089e67110795b69a95705f38952d8f';
		}
		this.audio = new Audio(full_stream_url);
		this.audio.play();
		renderLibrary(fullLibrary);
	},
	_setIDs: function(playlist_id) {
		this.next_id = playlist_id+1;
		this.current_id = playlist_id;
		this.prev_id = playlist_id-1;	
	},
	_addNextSongHandler: function() {
		this._setIDs(this.current_id+1);
		if (!this.is_dissociated) {
			this.soundcloud_id = this.playlist[this.current_id].id;
			var full_stream_url = this.playlist[this.current_id].stream_url+'?client_id=96089e67110795b69a95705f38952d8f';
		} else {
			this.soundcloud_id = this.dissociated_playlist[this.current_id].id;
			var full_stream_url = this.dissociated_playlist[this.current_id].stream_url+'?client_id=96089e67110795b69a95705f38952d8f';
		}
		this.audio = new Audio(full_stream_url);
		this.audio.addEventListener('ended', this._addNextSongHandler.bind(this));
		this.audio.play();
		renderLibrary(fullLibrary);		
	},
	dissociate: function() {
		if (this.is_dissociated) return; 
		this.is_dissociated = true;
		this.dissociated_playlist = this.playlist.slice();
	},
	associate: function() {
		this.is_dissociated = false;
		this.dissociated_playlist = null;
	}
}

 $('#play_next').click(function() {
 	songPlayer.playNext();
 });
$('#play_prev').click(function() {
	songPlayer.playPrevious();
});
var loadLibrary = function() {
	var client_id = 'client_id=96089e67110795b69a95705f38952d8f'
	$('#main').html('<p id="load-status"> Loading Your Full Library </p>');
	$.get('http://api.soundcloud.com/users/29864265/favorites?'+client_id+'&limit=200&linked_partitioning=1', function(response) {
			responseList.push(response.collection);
			buildLibrary(response.next_href);
			$('#load-status').text('Loading Your Full Library ('+response.collection.length+' songs)');
		});		
}

//Recursive function to sequentially get list of songs in library.
var buildLibrary = function(next_href) {
	$.get(next_href).then(function(response) {
		console.log("Still loading...");
		responseList.push(response.collection);
		if (response.next_href) {
			var loadedCount = 0;
			responseList.forEach(function(collection) {
				loadedCount += collection.length;
			});
			$('#load-status').text('Loading Your Full Library ('+loadedCount+' songs)');			
			buildLibrary(response.next_href);
		} 
		else {
			console.log('Done');
			combineLists();
		} 
	});
}

//After each batch is loaded, goes through and combines them into one library.
var combineLists = function() {
	console.log('Called combineLists...')
	fullLibrary = [];
	for (var i = 0; i < responseList.length; i++) {
		fullLibrary = fullLibrary.concat(responseList[i])
	}
	for (var i = 0; i < fullLibrary.length; i++) {
		fullLibrary[i].sclibrary_id = i;
	}
	console.log('Setting localstorage..');
	console.log(fullLibrary);
	localStorage.setItem("fullLibrary", JSON.stringify(fullLibrary));
	$('#main').empty();
	fullLibrary = fullLibrary;
	console.log('Calling render...')
	renderLibrary(fullLibrary);	
}

var loadPlaylists = function() {
	var client_id ='96089e67110795b69a95705f38952d8f'
	$.get('http://api.soundcloud.com/users/29864265/playlists?client_id='+client_id, function(response) {
			response.forEach(function(playlist) {
				$('#main').append('<h1>'+playlist.title+'</h1>');
				playlist.tracks.forEach(function(song) {
					$('#main').append('<h3>'+song.user.username+'</h3>');
					$('#main').append('<p>'+song.title+'</p>');					
				});
			})
		});		
}

//-------------------------------------------------------------------------------------------------------//
var toggle = function(button) {
	if ($('#sort-'+button).attr('sort') == 'descending') {
		$('#sort-'+button).attr('sort', 'ascending');
	} else {
		$('#sort-'+button).attr('sort', 'descending');
	}	
}

$('#sort-title').click(function() {
	toggle('title');
	librarySort = 0;
	songPlayer.dissociate();
	renderLibrary(fullLibrary);
});

$('#sort-artist').click(function() {
	toggle('artist');
	librarySort = 1;
	songPlayer.dissociate();
	renderLibrary(fullLibrary);
});

$("#sort-date").click(function() {
	toggle('date');
	librarySort = 2;
	songPlayer.dissociate();
	renderLibrary(fullLibrary);
});

$("#sort-favorites").click(function() {
	toggle('favorites');
	librarySort = 3;
	songPlayer.dissociate();
	renderLibrary(fullLibrary);
});

$("#sort-plays").click(function() {
	toggle('plays');
	librarySort = 4;
	songPlayer.dissociate();
	renderLibrary(fullLibrary);
});

$("#shuffle").click(function() {
	librarySort = 5;
	songPlayer.dissociate();
	renderLibrary(fullLibrary);
});

$("#remixes").change(function() {
	songPlayer.dissociate();
	renderLibrary(fullLibrary, true);
});

$("#originals").change(function() {
	songPlayer.dissociate();
	renderLibrary(fullLibrary, true);
});

$('#refresh').click(function() {
	songPlayer.dissociate();
	loadLibrary();
});

$('#searchbar').keyup(function() {
	clearTimeout(searchTimer);
	searchTimer = setTimeout(function() {
		songPlayer.dissociate();
		renderLibrary(fullLibrary, true);
	}, 250);
});

//-------------------------------------------------------------------------------------------------------------//

var startLibrary = function() {
	if (localStorage.getItem("fullLibrary") == null) {
		//Basically if it's a new user that hasn't used the site and doesn't have their library saved.
		console.log("Starting library load.");
		loadLibrary();

	} else {
		console.log("Loading from local storage.");
		fullLibrary = JSON.parse(localStorage.getItem("fullLibrary"));
		//addNewFavorites();
		fullLibrary = fullLibrary;
		renderLibrary(fullLibrary);	
	}	
}

// client_id: '96089e67110795b69a95705f38952d8f'
// redirect_uri: 'http://sclibrary.testing.com:3000/callback.html'

//Kick off the site.
$(document).ready(function() {
	startLibrary();
});

var visualizer = function() {
  var song_id = songPlayer.soundcloud_id;
  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  var audioSrc = audioCtx.createMediaElementSource(songPlayer.audio);
  var analyser = audioCtx.createAnalyser();

  // Bind our analyser to the media element source.
  audioSrc.connect(analyser);
  audioSrc.connect(audioCtx.destination);

  //var frequencyData = new Uint8Array(analyser.frequencyBinCount);
  var frequencyData = new Uint8Array(256);

  var svgHeight = '128';
  var svgWidth = document.getElementById('player_'+song_id).offsetWidth;
  var barPadding = '1';

  function createSvg(parent, height, width) {
    return d3.select(parent).append('svg').attr('height', height).attr('width', width);
  }
  var svg = createSvg('#player_'+song_id, svgHeight, svgWidth);

  // Create our initial D3 chart.
  svg.selectAll('rect')
      .data(frequencyData)
      .enter()
      .append('rect')
      .attr('x', function (d, i) {
        return i * (svgWidth / frequencyData.length);
      })
      .attr('width', svgWidth / frequencyData.length - barPadding);


  // d3.select(window).on('resize', function() {
  //   var width = document.getElementById('player_'+song_id).offsetWidth;
  //   console.log(width);
  //   d3.select("player_"+song_id).attr("width", width);
  // });

  // Continuously loop and update chart with frequency data.
  function renderChart() {
       requestAnimationFrame(renderChart);

       // Copy frequency data to frequencyData array.
       analyser.getByteFrequencyData(frequencyData);

       // Update d3 chart with new data.
       svgWidth = document.getElementById('player_'+song_id).offsetWidth;
       svg.attr('width', svgWidth);

      svg.selectAll('rect')
        .data(frequencyData)
        .attr('x', function (d, i) {
          return i * (svgWidth / frequencyData.length);
        })
        .attr('width', svgWidth / frequencyData.length - barPadding)
        .attr('y', function(d) {
        d = Math.max((d/255)*svgHeight, 3);
         return svgHeight-d;
        })
        .attr('height', function(d) {
        d = Math.max((d/255)*svgHeight, 3)
          return d;
        })
      .attr('fill', function(d, i) {
          d = Math.max((d/255)*svgHeight, 3);
          if ((i/256) < (songPlayer.audio.currentTime/songPlayer.audio.duration)) {
            return 'rgb(66,133,244)';              
          } else {
            return 'rgba(255,135,50, 0.35)'
          }
      });
  }
  // Run the loop
  renderChart();
};

})();





