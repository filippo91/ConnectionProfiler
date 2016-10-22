package controllers.plots;

import java.util.Collection;

import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import models.SizeDownload;
import models.User;
import services.PlotsService;
import services.PlotsService.View;

@RestController
@CrossOrigin
public class PieSizeController {
	private static final Logger log = LoggerFactory.getLogger(PieSizeController.class);
	
	@Autowired PlotsService plotsService;
	
	@GetMapping("/pieSize/{year}/{month}/{day}/{view}")
	public Collection<SizeDownload> getDomainSizeDownload(
			@PathVariable int year, 
			@PathVariable int month, 
			@PathVariable int day,
			@PathVariable View view, 
			@AuthenticationPrincipal User user){
		//User user = userService.getCurrentUser();
		int uuid = user.getUid();
		DateTime d = new DateTime(year, month+1, day, 0, 0);
		log.debug("getDomainSizeDownload for " + uuid);
		return plotsService.getDomainSizeDownload(uuid, year, month, day, view);
	}
}
