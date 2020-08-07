class Scholorship {

	public static void main(String[] args) {
		int syear = 3,smarks = 80;
	
	switch(syear) {
		case 1: System.out.println("Student not eligible for scholarship");
			break;
		case 2: System.out.println("Student not eligible for scholarship");
			break;
		case 3: {
				switch(smarks){
					case 80: System.out.println("Student eligible for scholarship");
						 break;

					default: System.out.println("give positive marks");
						 break;
				}//inner switch
			}
			break;
			
		default:System.out.println("give positive year");
			break;

	}//outer switch

	}//main


}//end class




