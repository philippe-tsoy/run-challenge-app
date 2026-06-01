-- Point journey_nodes at local public/journey assets (after you download the files)

update journey_nodes set image_url = '/journey/hobbiton.jpg' where lower(name) = 'hobbiton';
update journey_nodes set image_url = '/journey/buckland.jpg' where lower(name) = 'buckland';
update journey_nodes set image_url = '/journey/old-forest.jpg' where lower(name) = 'old forest';
update journey_nodes set image_url = '/journey/bree.jpg' where lower(name) = 'bree';
update journey_nodes set image_url = '/journey/weathertop.jpg' where lower(name) = 'weathertop';
update journey_nodes set image_url = '/journey/ford-of-bruinen.jpg' where lower(name) = 'ford of bruinen';
update journey_nodes set image_url = '/journey/rivendell.jpg' where lower(name) = 'rivendell';
