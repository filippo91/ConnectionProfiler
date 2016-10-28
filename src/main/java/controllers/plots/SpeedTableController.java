package controllers.plots;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import models.TableDownload;
import models.User;
import services.PlotsService;

@RestController
@CrossOrigin
public class SpeedTableController {
	private static final Logger log = LoggerFactory.getLogger(SpeedTableController.class);
	
	@Autowired PlotsService plotsService;
	
	@GetMapping("/speedTable/{page}/{size}")
	public TableDownload getDownloadsSpeedByWeek(
			@PathVariable int page, 
			@PathVariable int size,
			@AuthenticationPrincipal User user){
		int uuid = user.getUid();
		
		return plotsService.getDownloadsSpeed(uuid, page, size);
	}
}
