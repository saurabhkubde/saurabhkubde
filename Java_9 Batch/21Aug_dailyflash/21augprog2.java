import java.io.*;

class unitprice {
	public static void main(String[] args) throws IOException {
		InputStreamReader isr = new InputStreamReader(System.in);
		BufferedReader br = new BufferedReader(isr); 


		int unit = Integer.parseInt(br.readLine());
	

		double total;

		if(unit <= 50) {
			total =	unit * 0.5;
		}else if(unit > 50 && unit <= 150){
			total = unit * 0.75;
		}else if(unit >150 && unit <= 250) {
			total = unit * 1.20;
		}else {
			total = unit * 1.50;
		}


		System.out.println("total price:"+total);

	}

}	
		

