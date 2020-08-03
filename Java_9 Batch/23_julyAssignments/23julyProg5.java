class Ifelse {
	
	boolean iseligible(int aten) {
		if(aten < 75) { 
			System.out.println("Processing....");
			System.out.println("Student is not eligible for exam");
		}
		else { 
			System.out.println("Processing....");
			System.out.println("Student is eligible for exam");
		}
		return true;
	}
	
	
}

class Main {
	public static void main(String[] args) {
		int aten = 65 ;
	
		Ifelse obj = new Ifelse();
		if( aten < 75 ) {
			System.out.println("Student attendance is "+aten); 
			obj.iseligible(aten);
		} else {
			System.out.println("Student attendance is "+aten); 
			obj.iseligible(aten);
		}
		
	}

}
		

