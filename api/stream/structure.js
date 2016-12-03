Route -> Torrent \
				  \ parse torrent -> returns hash table and trackers
				   \ parse magnet -> resturns hash and trackers and length
				    \ tracker -> contact trackers until connection and ask for peers to begin DHT
				     \ RPC -> ping peer nodes and aske for more nodes and peers
				      .\ nodes -> manages all nodes Buckets
					   .\ bucket -> stocks up to 20 nodes in youth order
					    .\ contact -> all infos for a node (nodeId, ip, port)
