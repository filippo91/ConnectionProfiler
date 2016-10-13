package controllers.plots;

import java.util.Collection;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import models.Download;
import models.User;
import services.DownloadService;

@RestController
@CrossOrigin
public class SpeedTableController {
	private static final Logger log = LoggerFactory.getLogger(SpeedTableController.class);
	
	@Autowired DownloadService downloadService;
	
	@GetMapping("/speedTable/{page}/{size}")
	public Collection<Download> getDownloadsSpeedByWeek(
			@PathVariable int page, 
			@PathVariable int size,
			@AuthenticationPrincipal User user){
		int uuid = user.getId();
		
		return downloadService.getDownloadsSpeed(uuid, page, size);
	}
}
