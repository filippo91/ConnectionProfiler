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

import models.FrequencyAccess;
import models.User;
import services.PlotsService;
import services.PlotsService.View;

@RestController
@CrossOrigin
public class PieAccessesController {
	private static final Logger log = LoggerFactory.getLogger(PieAccessesController.class);
	
	@Autowired PlotsService plotsService;
	
	@GetMapping("/pieAccesses/{year}/{month}/{day}/{view}")
	public Collection<FrequencyAccess> getDomainFrequencyAccess(
			@PathVariable int year, 
			@PathVariable int month, 
			@PathVariable int day,
			@PathVariable View view,
			@AuthenticationPrincipal User user){
		int uuid = user.getUid();
		DateTime d = new DateTime(year, month+1, day, 0, 0);
		return plotsService.getDomainFrequencyAccess(uuid, year, month, day, view);
	}
}
